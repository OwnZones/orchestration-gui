import { SourceReference, SourceWithId } from './../../interfaces/Source';
import {
  Production,
  ProductionSettings,
  StartProductionStep,
  StopProductionStep
} from '../../interfaces/production';
import {
  connectControlPanelToPipeline,
  createPipelineOutputs,
  getPipeline,
  getPipelineCompact,
  getPipelines,
  removePipelineStreams,
  resetPipeline
} from '../ateliereLive/pipelines/pipelines';
import {
  createMultiviewForPipeline,
  deleteAllMultiviewsFromPipeline
} from '../ateliereLive/pipelines/multiviews/multiviews';
import {
  getSourceIdFromSourceName,
  getUuidFromIngestName
} from '../ateliereLive/ingest';
import { PipelineStreamSettings } from '../../interfaces/pipeline';
import {
  connectIngestToPipeline,
  deleteStreamByUuid
} from '../ateliereLive/streams';
import { disconnectReceiver } from '../ateliereLive/controlconnections';
import {
  ResourcesCompactPipelineResponse,
  ResourcesConnectionUUIDResponse,
  ResourcesPipelineResponse,
  ResourcesReceiverNetworkEndpoint,
  ResourcesSenderNetworkEndpoint
} from '../../../types/ateliere-live';
import { getSourcesByIds } from './sources';
import { SourceToPipelineStream } from '../../interfaces/Source';
import {
  getAvailablePortsForIngest,
  getCurrentlyUsedPorts,
  initDedicatedPorts
} from '../ateliereLive/utils/fwConfigPorts';
import { getAudioMapping } from './inventory';
import { Log } from '../logger';
import { putProduction } from './productions';
import { getControlPanels } from '../ateliereLive/controlpanels';
import { Result } from '../../interfaces/result';
import { Monitoring } from '../../interfaces/monitoring';
import { getDatabase } from '../mongoClient/dbClient';
import { updatedMonitoringForProduction } from './job/syncMonitoring';
import { createControlPanelWebSocket } from '../ateliereLive/websocket';
import { ObjectId } from 'mongodb';

const isUsed = (pipeline: ResourcesPipelineResponse) => {
  const hasStreams = pipeline.streams.length > 0;
  const hasMultiviews = pipeline.multiviews.length > 0;
  const hasActiveOutputStream = pipeline.outputs.some(
    (ouput) => ouput.active_streams
  );
  const hasUsedControlReceiver =
    pipeline.control_receiver.outgoing_connections.length > 0 ||
    pipeline.control_receiver.listening_interface;
  return (
    hasStreams ||
    hasMultiviews ||
    hasActiveOutputStream ||
    hasUsedControlReceiver
  );
};

async function connectIngestSources(
  productionSources: SourceReference[],
  productionSettings: ProductionSettings,
  sources: SourceWithId[],
  usedPorts: Set<number>
) {
  const sourceToPipelineStreams: SourceToPipelineStream[] = [];
  let input_slot = 0;

  for (const source of sources) {
    input_slot =
      productionSources.find((s) => s._id === source._id.toString())
        ?.input_slot || input_slot + 1;
    const ingestUuid = await getUuidFromIngestName(
      source.ingest_name,
      false
    ).catch((error) => {
      Log().warn("Can't get UUID from Ingest name! \nError: ", error);
      throw `Could not find UUID for ${source.ingest_name}`;
    });
    const sourceId = await getSourceIdFromSourceName(
      ingestUuid,
      source.ingest_source_name,
      false
    );
    const audioSettings = await getAudioMapping(new ObjectId(source._id));
    const newAudioMapping = audioSettings?.audio_stream?.audio_mapping;
    const audioMapping = newAudioMapping?.length ? newAudioMapping : [[0, 1]];

    for (const pipeline of productionSettings.pipelines) {
      const availablePorts = getAvailablePortsForIngest(
        source.ingest_name,
        usedPorts
      );

      if (availablePorts.size === 0) {
        Log().error(`No available ports for ingest '${source.ingest_name}'`);
        throw `No available ports for ingest '${source.ingest_name}'`;
      }

      const availablePort = availablePorts.values().next().value;
      Log().info(
        `Allocated port ${availablePort} on '${source.ingest_name}' for ${source.ingest_source_name}`
      );
      const stream: PipelineStreamSettings = {
        pipeline_id: pipeline.pipeline_id!,
        alignment_ms: pipeline.alignment_ms,
        audio_format: pipeline.audio_format,
        audio_sampling_frequency: pipeline.audio_sampling_frequency,
        bit_depth: pipeline.bit_depth,
        convert_color_range: pipeline.convert_color_range,
        encoder: pipeline.encoder,
        encoder_device: pipeline.encoder_device,
        format: pipeline.format,
        frame_rate_d: pipeline.frame_rate_d,
        frame_rate_n: pipeline.frame_rate_n,
        gop_length: pipeline.gop_length,
        height: pipeline.height,
        max_network_latency_ms: pipeline.max_network_latency_ms,
        pic_mode: pipeline.pic_mode,
        speed_quality_balance: pipeline.speed_quality_balance,
        video_kilobit_rate: pipeline.video_kilobit_rate,
        width: pipeline.width,
        ingest_id: ingestUuid,
        source_id: sourceId,
        input_slot,
        audio_mapping: JSON.stringify(audioMapping),
        interfaces: [
          {
            ...pipeline.interfaces[0],
            port: availablePort
          }
        ]
      };
      try {
        Log().info(
          `Connecting '${source.ingest_name}/${ingestUuid}:${source.ingest_source_name}' to '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`
        );
        Log().debug(stream);
        const result = await connectIngestToPipeline(stream).catch((error) => {
          Log().error(
            `Source '${source.ingest_name}/${ingestUuid}:${source.ingest_source_name}' failed to connect to '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`,
            error
          );
          throw `Source '${source.ingest_name}/${ingestUuid}:${source.ingest_source_name}' failed to connect to '${pipeline.pipeline_name}/${pipeline.pipeline_id}': ${error.message}`;
        });
        usedPorts.add(availablePort);
        sourceToPipelineStreams.push({
          source_id: source._id.toString(),
          stream_uuid: result.stream_uuid,
          input_slot: input_slot
        });
        Log().info(
          `Stream '${result.stream_uuid}' from '${source.ingest_name}/${ingestUuid}' to '${pipeline.pipeline_name}/${pipeline.pipeline_id}' connected`
        );
      } catch (error) {
        Log().debug(stream);
        Log().error(error);
        throw error;
      }
    }
  }
  return sourceToPipelineStreams;
}

async function insertPipelineUuid(productionSettings: ProductionSettings) {
  const availablePipelines = await getPipelines().catch((error) => {
    Log().error(
      `Failed to get pipeline IDs for '${productionSettings.name}'`,
      error
    );
    throw `Failed to get pipeline IDs for '${productionSettings.name}: ${error.message}'`;
  });

  for (const pipelinePreset of productionSettings.pipelines) {
    const pipeline = availablePipelines.find(
      (p: ResourcesCompactPipelineResponse) =>
        p.name === pipelinePreset.pipeline_name
    );
    if (pipeline) {
      pipelinePreset.pipeline_id = pipeline.uuid;
    } else {
      Log().error(
        `No pipeline with name ${pipelinePreset.pipeline_name} was found`
      );
      throw `No pipeline with name ${pipelinePreset.pipeline_name} was found`;
    }
  }
}

//TODO: fix error messages
export async function stopPipelines(pipelineIds: string[]) {
  for (const id of pipelineIds) {
    Log().info(`Stopping pipeline '${id}'`);
    const pipeline = await getPipelineCompact(id).catch((error) => {
      Log().error(`Failed to get pipeline '${id}'`, error);
      throw `Failed to get pipeline '${id}': ${error.message}`;
    });

    const receiver = pipeline.control_receiver;

    disconnectConnections(receiver.incoming_connections, id).catch((e) =>
      Log().error(
        `Failed to disconnect incoming control connections from pipeline: ${id}`,
        e
      )
    );
    disconnectConnections(receiver.outgoing_connections, id).catch((e) =>
      Log().error(
        `Failed to disconnect outgoing control connections from pipeline: ${id}`,
        e
      )
    );

    await removePipelineStreams(id).catch((error) => {
      Log().error(
        `Failed to remove streams connected to piepline '${id}'`,
        error
      );

      throw `Failed to remove streams connected to piepline '${id}': ${error.message}`;
    });

    await deleteAllMultiviewsFromPipeline(id).catch((error) => {
      Log().error(`Failed to remove multiview from pipeline '${id}'`, error);
      throw `Failed to remove multiview from pipeline '${id}': ${error}`;
    });
    Log().info(`Pipeline '${id}' stopped`);
  }

  return pipelineIds;
}

async function disconnectConnections(
  connections:
    | ResourcesReceiverNetworkEndpoint[]
    | ResourcesSenderNetworkEndpoint[]
    | ResourcesConnectionUUIDResponse[]
    | undefined,
  id: string
) {
  try {
    const errors: string[] = [];
    const closed: string[] = [];
    for (const connection of connections || []) {
      Log().info(
        `Closing connection '${connection.connection_uuid}' for pipeline '${id}'`
      );
      disconnectReceiver(connection.connection_uuid)
        .then(() => {
          Log().info(
            `Connection '${connection.connection_uuid}' for pipeline '${id}' closed`
          );
          closed.push(
            `Connection '${connection.connection_uuid}' for pipeline '${id}' closed`
          );
        })
        .catch((error) => {
          Log().error(
            `Failed to disconnect receiver '${connection.connection_uuid}' from pipeline '${id}'`,
            error
          );
          errors.push(
            `Failed to disconnect receiver '${connection.connection_uuid}' from pipeline '${id}'`
          );
        });
    }
    if (errors.length > 0) {
      throw errors.join(', ');
    }
  } catch (e) {
    Log().error(e);
    throw e;
  }
}

export async function stopProduction(
  production: Production
): Promise<Result<StopProductionStep[]>> {
  let disconnectConnectionsStatus = {
    ok: true,
    value: {
      step: 'disconnect_connections',
      success: true
    } as StopProductionStep
  };
  let removePipelineStreamsStatus = {
    ok: true,
    value: {
      step: 'remove_pipeline_streams',
      success: true
    } as StopProductionStep
  };
  let deleteMultiviewsStatus = {
    ok: true,
    value: {
      step: 'remove_pipeline_multiviews',
      success: true
    } as StopProductionStep
  };
  const pipelineIds = production.production_settings.pipelines.map(
    (p) => p.pipeline_id
  );

  const controlPanelWS = await createControlPanelWebSocket();
  const htmlSources = production.sources.filter(
    (source) => source.type === 'html'
  );
  const mediaPlayerSources = production.sources.filter(
    (source) => source.type === 'mediaplayer'
  );

  for (const source of production.sources) {
    for (const stream_uuid of source.stream_uuids || []) {
      await deleteStreamByUuid(stream_uuid).catch((error) => {
        Log().error('Failed to delete stream! \nError: ', error);
      });
    }
  }

  for (const source of htmlSources) {
    controlPanelWS.closeHtml(source.input_slot);
  }

  for (const source of mediaPlayerSources) {
    controlPanelWS.closeMediaplayer(source.input_slot);
  }

  controlPanelWS.close();

  for (const id of pipelineIds) {
    Log().info(`Stopping pipeline '${id}'`);
    if (!id) continue;
    try {
      const pipeline = await getPipelineCompact(id).catch((error) => {
        Log().error(`Failed to get pipeline '${id}'`, error);
        throw `Failed to get pipeline '${id}' ${error.message}`;
      });
      const receiver = pipeline.control_receiver;

      const errors: string[] = [];
      const disconnects: Promise<void>[] = [];
      disconnects.push(
        disconnectConnections(receiver.incoming_connections, id)
      );
      disconnects.push(
        disconnectConnections(receiver.outgoing_connections, id)
      );
      await Promise.allSettled(disconnects).then((results) => {
        results.forEach((result) => {
          if (result.status === 'rejected') {
            errors.push(result.reason);
          }
        });
      });
      if (errors.length > 0) throw errors.join(', ');
    } catch (e) {
      if (typeof e !== 'string') {
        disconnectConnectionsStatus = {
          ok: false,
          value: { step: 'disconnect_connections', success: false }
        };
      } else {
        disconnectConnectionsStatus = {
          ok: false,
          value: { step: 'disconnect_connections', success: false, message: e }
        };
      }
    }
    try {
      await removePipelineStreams(id).catch((error) => {
        Log().error(
          `Failed to remove streams connected to pipeline '${id}'`,
          error
        );

        throw `Failed to remove streams connected to pipeline '${id}' ${error}`;
      });
    } catch (e) {
      if (typeof e !== 'string') {
        removePipelineStreamsStatus = {
          ok: false,
          value: {
            step: 'remove_pipeline_streams',
            success: false,
            message: 'Unexpected error occured'
          }
        };
      } else {
        removePipelineStreamsStatus = {
          ok: false,
          value: { step: 'remove_pipeline_streams', success: false, message: e }
        };
      }
    }

    try {
      await deleteAllMultiviewsFromPipeline(id).catch((error) => {
        Log().error(`Failed to remove multiview from pipeline '${id}'`, error);
        throw `Failed to remove multiview from pipeline '${id}': ${error.message}`;
      });
    } catch (e) {
      if (typeof e !== 'string') {
        deleteMultiviewsStatus = {
          ok: false,
          value: {
            step: 'remove_pipeline_multiviews',
            success: false,
            message: 'Unexpected error occured'
          }
        };
      } else {
        deleteMultiviewsStatus = {
          ok: false,
          value: {
            step: 'remove_pipeline_multiviews',
            success: false,
            message: e
          }
        };
      }
    }
    Log().info(`Pipeline '${id}' stopped`);
  }
  if (
    !disconnectConnectionsStatus.ok ||
    !removePipelineStreamsStatus.ok ||
    !deleteMultiviewsStatus.ok
  ) {
    return {
      ok: false,
      value: [
        disconnectConnectionsStatus.value,
        removePipelineStreamsStatus.value,
        deleteMultiviewsStatus.value
      ],
      error: 'Failed to stop production properly'
    };
  }
  return {
    ok: true,
    value: [
      disconnectConnectionsStatus.value,
      removePipelineStreamsStatus.value,
      deleteMultiviewsStatus.value
    ]
  };
}

export async function startProduction(
  production: Production
): Promise<Result<StartProductionStep[]>> {
  const { production_settings } = production;
  Log().info(
    `Starting production '${production.name}' with preset '${production_settings.name}'`
  );

  await initDedicatedPorts();

  let streams: SourceToPipelineStream[] = [];
  // Try to setup streams from ingest(s) to pipeline(s) start
  try {
    // Get sources from the DB
    const sources = await getSourcesByIds(
      production.sources
        .filter(
          (source) =>
            source._id !== undefined && source.type === 'ingest_source'
        )
        .map((source) => {
          return source._id!.toString();
        })
    ).catch((error) => {
      if (error === "Can't connect to Database") {
        throw "Can't connect to Database";
      }
      Log().warn("Can't get Source!", error);
      throw "Can't get source!";
    });

    // Lookup pipeline UUIDs from pipeline names and insert to production_settings
    await insertPipelineUuid(production_settings).catch((error) => {
      throw error;
    });

    // Fetch expanded pipeline objects from Ateliere Live
    const pipelinesToUsePromises = production_settings.pipelines.map(
      (pipeline) => {
        return getPipeline(pipeline.pipeline_id!);
      }
    );
    const pipelinesToUse = await Promise.all(pipelinesToUsePromises);

    // Check if pipelines are already in use by another production
    const hasAlreadyUsedPipeline = pipelinesToUse.filter((pipeline) =>
      isUsed(pipeline)
    );

    if (hasAlreadyUsedPipeline.length > 0) {
      Log().error(
        `Production has pipeline that is already in use: ${hasAlreadyUsedPipeline.map(
          (p) => `${p.name} `
        )}`
      );
      throw `Production has pipeline that is already in use: ${hasAlreadyUsedPipeline.map(
        (p) => p.name
      )}`;
    }

    const resetPipelinePromises = production_settings.pipelines.map(
      (pipeline) => {
        return resetPipeline(pipeline.pipeline_id!);
      }
    );
    await Promise.all(resetPipelinePromises).catch((error) => {
      throw `Failed to reset pipelines: ${error}`;
    });

    // Fetch all control panels from Ateliere Live
    const allControlPanels = await getControlPanels();
    // Check which control panels that should be used by this production
    const controlPanelsToUse = allControlPanels.filter((controlPanel) =>
      production.production_settings.control_connection.control_panel_name?.includes(
        controlPanel.name
      )
    );
    // Check if control panels are already in use by another production
    const hasAlreadyUsedControlPanel = controlPanelsToUse.filter(
      (controlPanel) => controlPanel.outgoing_connections.length > 0
    );

    if (hasAlreadyUsedControlPanel.length > 0) {
      Log().error(
        `Production has control panel already in use: ${hasAlreadyUsedControlPanel.map(
          (c) => `${c.name} `
        )}`
      );
      throw `Production has control panel already in use: ${hasAlreadyUsedControlPanel.map(
        (c) => `${c.name} `
      )}`;
    }

    // TODO: Is this really neccessary? We have checked that pipeline and controlpanels are not in use by another production
    // can they still be in a state where we need to stop them? Removing streams and multiviews might be left to do though..
    await stopPipelines(
      production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
    ).catch((error) => {
      throw `Failed to stop pipelines during startup: ${error}`;
    });

    // TODO: This will fetch the pipelines once again from Ateliere Live, but we already have them in pipelinesToUse
    const usedPorts = await getCurrentlyUsedPorts(
      pipelinesToUse.map((pipeline) => {
        return pipeline.uuid;
      })
    );
    streams = await connectIngestSources(
      production.sources,
      production_settings,
      sources,
      usedPorts
    ).catch(async (error) => {
      Log().error('Stopping pipelines');
      await stopPipelines(
        production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
      ).catch((error) => {
        throw `Failed to stop pipelines after production start failure: ${error}`;
      });
      throw error;
    });
  } catch (e) {
    Log().error('Could not setup streams');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: [{ step: 'streams', success: false }],
        error: 'Could not setup streams: Unexpected error occured'
      };
    }
    return {
      ok: false,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: false, message: e }
      ],
      error: e
    };
  } // Try to setup streams from ingest(s) to pipeline(s) start end

  // Try to connect control panels and pipeline-to-pipeline connections start
  try {
    // TODO: This will re-fetch pipelines from the Ateliere Live API, but we fetched them above into pipelinesToUse
    await connectControlPanelToPipeline(
      production_settings.control_connection,
      production_settings.pipelines
    ).catch(async (error) => {
      Log().error('Stopping pipelines');
      await stopPipelines(
        production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
      ).catch((error) => {
        throw `Failed to stop pipelines after production start failure: ${error}`;
      });
      throw error;
    });
  } catch (error) {
    Log().error('Could not setup control panels');
    Log().error(error);
    if (typeof error !== 'string') {
      return {
        ok: false,
        value: [
          { step: 'start', success: true },
          { step: 'streams', success: true },
          { step: 'control_panels', success: false }
        ],
        error: 'Unknown error occured'
      };
    }
    return {
      ok: false,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: true },
        { step: 'control_panels', success: false, message: error }
      ],
      error: error
    };
  } // Try to connect control panels and pipeline-to-pipeline connections end

  const controlPanelWS = await createControlPanelWebSocket();
  const htmlSources = production.sources.filter(
    (source) => source.type === 'html'
  );
  const mediaPlayerSources = production.sources.filter(
    (source) => source.type === 'mediaplayer'
  );

  for (const source of htmlSources) {
    controlPanelWS.createHtml(source.input_slot);
  }

  for (const source of mediaPlayerSources) {
    controlPanelWS.createMediaplayer(source.input_slot);
  }

  controlPanelWS.close();

  // Try to setup pipeline outputs start
  try {
    for (const pipeline of production_settings.pipelines) {
      await createPipelineOutputs(pipeline);
    }
  } catch (e) {
    Log().error('Could not setup pipeline outputs');
    Log().error(e);
    Log().error('Stopping pipelines');
    await stopPipelines(
      production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
    ).catch((error) => {
      throw `Failed to stop pipelines after production start failure: ${error}`;
    });
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: [
          { step: 'start', success: true },
          { step: 'streams', success: true },
          { step: 'control_panels', success: true },
          { step: 'pipeline_outputs', success: false }
        ],
        error: 'Unknown error occured'
      };
    }
    return {
      ok: false,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: true },
        { step: 'control_panels', success: true },
        { step: 'pipeline_outputs', success: false, message: e }
      ],
      error: e
    };
  } // Try to setup pipeline outputs end

  // Try to setup multiviews start
  try {
    if (!production.production_settings.pipelines[0].multiviews) {
      Log().error(
        `No multiview settings specified for production: ${production.name}`
      );
      throw `No multiview settings specified for production: ${production.name}`;
    }

    const runtimeMultiviews = await createMultiviewForPipeline(
      production_settings,
      production.sources
    ).catch(async (error) => {
      Log().error(
        `Failed to create multiview for pipeline '${production_settings.pipelines[0].pipeline_name}/${production_settings.pipelines[0].pipeline_id}'`,
        error
      );
      Log().error('Stopping pipelines');
      await stopPipelines(
        production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
      ).catch((error) => {
        throw `Failed to stop pipelines after production start failure: ${error}`;
      });
      throw `Failed to create multiview for pipeline '${production_settings.pipelines[0].pipeline_name}/${production_settings.pipelines[0].pipeline_id}': ${error}`;
    });

    runtimeMultiviews.flatMap((runtimeMultiview, index) => {
      const multiview = production.production_settings.pipelines[0].multiviews;
      if (multiview && multiview[index]) {
        return (multiview[index].multiview_id = runtimeMultiview.id);
      }
    });

    Log().info(
      `Production '${production.name}' with preset '${production_settings.name}' started`
    );
  } catch (e) {
    Log().error('Could not start multiviews');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: [
          { step: 'start', success: true },
          { step: 'streams', success: true },
          { step: 'control_panels', success: true },
          { step: 'pipeline_outputs', success: false },
          { step: 'multiviews', success: false }
        ],
        error: 'Unknown error occured'
      };
    }
    return {
      ok: false,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: true },
        { step: 'control_panels', success: true },
        { step: 'pipeline_outputs', success: true },
        { step: 'multiviews', success: false, message: e }
      ],
      error: e
    };
  } // Try to setup multiviews end

  try {
    // Store updated production in database
    await putProduction(production._id.toString(), {
      ...production,
      sources: production.sources.map((source) => {
        const streamsForSource = streams?.filter(
          (stream) => stream.source_id === source._id?.toString()
        );
        return {
          ...source,
          stream_uuids:
            streamsForSource?.map((s) => s.stream_uuid) || undefined,
          input_slot: source.input_slot
        };
      }),
      isActive: true
    }).catch(async (error) => {
      Log().error(error);
      Log().error('Stopping pipelines');
      await stopPipelines(
        production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
      ).catch((error) => {
        throw `Failed to stop pipelines after production start failure: ${error}`;
      });
      throw error;
    });
    Log().info(`Production '${production.name}' isActive - started`);
  } catch (error) {
    Log().error('Error when updating started production in databse');
    Log().error(error);
    if (typeof error !== 'string') {
      return {
        ok: false,
        value: [
          { step: 'start', success: true },
          { step: 'streams', success: true },
          { step: 'control_panels', success: true },
          { step: 'pipeline_outputs', success: true },
          { step: 'multiviews', success: true },
          {
            step: 'sync',
            success: false,
            message: 'Failed to update production in database'
          }
        ],
        error: 'Unknown error occured'
      };
    }
    return {
      ok: false,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: true },
        { step: 'control_panels', success: true },
        { step: 'pipeline_outputs', success: true },
        { step: 'multiviews', success: true },
        {
          step: 'sync',
          success: false,
          message: 'Failed to update production in database'
        }
      ],
      error: error
    };
  }

  // Create a new monitoring object in the database
  try {
    const monitoringData = {
      productionName: production.name,
      productionId: production._id
    } as Monitoring;
    const updatedMonitoring = await updatedMonitoringForProduction(
      monitoringData,
      production
    );
    const db = await getDatabase();
    await db.collection('monitoring').insertOne(updatedMonitoring);

    return {
      ok: true,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: true },
        { step: 'control_panels', success: true },
        { step: 'pipeline_outputs', success: true },
        { step: 'multiviews', success: true },
        { step: 'sync', success: true },
        { step: 'monitoring', success: true }
      ]
    };
  } catch (error) {
    Log().error('Stopping pipelines, error: ', error);
    await stopPipelines(
      production_settings.pipelines.map((pipeline) => pipeline.pipeline_id!)
    ).catch((error) => {
      throw `Failed to stop pipelines after production start failure: ${error}`;
    });

    return {
      ok: false,
      value: [
        { step: 'start', success: true },
        { step: 'streams', success: true },
        { step: 'control_panels', success: true },
        { step: 'pipeline_outputs', success: true },
        { step: 'multiviews', success: true },
        { step: 'sync', success: true },
        {
          step: 'monitoring',
          success: false,
          message: 'Failed to create monitoring object in database'
        }
      ],
      error: 'Failed to create monitoring object in database'
    };
  }
}
