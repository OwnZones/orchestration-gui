import { Production } from '../../../interfaces/production';
import { getDatabase } from '../../mongoClient/dbClient';
import {
  getPipeline,
  getPipelines
} from '../../ateliereLive/pipelines/pipelines';
import {
  ResourcesControlPanelResponse,
  ResourcesControlRequestCounter,
  ResourcesControlResponseCounter,
  ResourcesControlStatusMessageCounter,
  ResourcesIngestResponse,
  ResourcesPipelineResponse,
  ResourcesReceiverNetworkEndpoint,
  ResourcesSenderNetworkEndpoint
} from '../../../../types/ateliere-live';
import { getControlPanels } from '../../ateliereLive/controlpanels';
import { getIngest, getIngests } from '../../ateliereLive/ingest';
import {
  MonitoringControlPanelStatusResponse,
  MonitoringOutputStatusResponse,
  MonitoringSourcesResponse,
  MonitoringStreamInterfaceIngest,
  MonitoringStreamInterfacePipeline,
  MonitoringStreamResponse,
  ResourcesOutputSrtClient,
  MonitoringControlReceiverStatusResponse,
  MonitoringMultiviewOutputResponse,
  CriticalIndicator,
  Monitoring,
  MonitoringOutputActiveStreamMpegTsSrt,
  ProductionErrors,
  MonitoringPipelinesResponse,
  MonitoringControlPanelResponse
} from '../../../interfaces/monitoring';
import { Log } from '../../logger';

export async function updatedMonitoringForProduction(
  prevMonitoring: Monitoring,
  production: Production
) {
  const productionId = production._id;
  const { production_settings } = production;

  const productionPipelineUUIDs = production_settings.pipelines.map(
    (pipeline) => pipeline.pipeline_id!
  );

  const allExpectedPipelines = await pipelinesForProduction(
    productionPipelineUUIDs
  );
  const pipelines: ResourcesPipelineResponse[] = [];
  for (const pipeline of allExpectedPipelines) {
    if (pipeline) {
      pipelines.push(pipeline);
    }
  }

  const ingestUuids = [
    ...new Set(
      (pipelines.length > 0 &&
        pipelines.flatMap((pipeline) =>
          pipeline.streams.map((stream) => stream.ingest_uuid)
        )) ||
        []
    )
  ];
  const sourceAndIngestIds = [
    ...new Set(
      (pipelines.length > 0 &&
        pipelines.flatMap((pipeline) =>
          pipeline.streams.flatMap(
            (stream) => stream.source_id + stream.ingest_uuid
          )
        )) ||
        []
    )
  ];

  const ingests = await getIngestsForProduction(
    ingestUuids,
    sourceAndIngestIds
  );

  const controlPanels = await getControlPanels();

  if (prevMonitoring.productionErrors == undefined) {
    const monitoringData = {
      productionName: production.name,
      productionId: productionId.toString(),
      productionErrors: {},
      productionComponents: {
        ingests: await createMonitoringIngests(ingestUuids),
        pipelines: await createMonitoringPipelines(pipelines),
        controlPanels: await createMonitoringComponentControlPanels(
          controlPanels,
          pipelines,
          production
        )
      },
      sources: createMonitoringSources(ingests.ingests, ingests.missing),
      streams: createStreams(ingests.ingests, ingests.missing, pipelines),
      outputs: createMonitoringOutputs(pipelines),
      multiviews: createMonitoringMultiviews(pipelines),
      controlPanels: await createMonitoringControlPanels(
        controlPanels,
        production,
        pipelines
      ),
      controlReceivers: createMonitoringControlReceiver(
        controlPanels,
        pipelines
      )
    } as Monitoring;
    monitoringData.productionErrors = getProductionError(monitoringData);

    return monitoringData;
  } else {
    //Create a new monitoring item on the existing one - compare values from previous monitored item to flag for errors.
    const apiMonitoring = {
      productionId: productionId.toString(),
      productionName: production.name,
      productionComponents: {
        ingests: await createMonitoringIngests(ingestUuids, prevMonitoring),
        pipelines: await createMonitoringPipelines(pipelines, prevMonitoring),
        controlPanels: await createMonitoringComponentControlPanels(
          controlPanels,
          pipelines,
          production,
          prevMonitoring
        )
      },
      sources: createMonitoringSources(
        ingests.ingests,
        ingests.missing,
        prevMonitoring
      ),
      streams: createStreams(
        ingests.ingests,
        ingests.missing,
        pipelines,
        prevMonitoring
      ),
      outputs: createMonitoringOutputs(pipelines),
      multiviews: createMonitoringMultiviews(pipelines),
      controlPanels: await createMonitoringControlPanels(
        controlPanels,
        production,
        pipelines
      ),
      controlReceivers: createMonitoringControlReceiver(
        controlPanels,
        pipelines
      )
    };

    //TODO: Remove this and refactor remaining helpers to handle monitoring data as createMonitoringSources and createStreams
    const nextMonitoring = {
      ...prevMonitoring,
      productionComponents: {
        pipelines: apiMonitoring.productionComponents.pipelines.sort((a, b) =>
          a.title.localeCompare(b.title)
        ),
        ingests: apiMonitoring.productionComponents.ingests.sort((a, b) =>
          a.title.localeCompare(b.title)
        ),
        controlPanels: apiMonitoring.productionComponents.controlPanels.sort(
          (a, b) => a.title.localeCompare(b.title)
        )
      },
      sources: apiMonitoring.sources.sort((a, b) =>
        a.title.localeCompare(b.title)
      ),
      streams: apiMonitoring.streams.sort((a, b) =>
        a.title.localeCompare(b.title)
      ),
      controlPanels: apiMonitoring.controlPanels
        .map((controlPanel) => {
          const prevControlPanel = prevMonitoring.controlPanels.find(
            (c) => c.uuid === controlPanel.uuid
          );
          if (!prevControlPanel) {
            return controlPanel;
          }
          return {
            ...controlPanel,
            failed_sent_requests: setCriticalIndicatorNumber(
              prevControlPanel?.failed_sent_requests,
              controlPanel.failed_sent_requests
            ),
            connected_to: controlPanel.connected_to.map((connected_to) => {
              const prevConnectedTo = prevControlPanel.connected_to.find(
                (c) => c.uuid === connected_to.uuid
              );
              if (!prevConnectedTo) {
                return connected_to;
              }
              return {
                ...connected_to,
                received_broken: setCriticalIndicatorNumber(
                  prevConnectedTo.received_broken,
                  connected_to.received_broken
                )
              };
            })
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title)),
      controlReceivers: apiMonitoring.controlReceivers
        .map((controlReceiver) => {
          const prevControlReceiver = prevMonitoring.controlReceivers.find(
            (c) => c.uuid === controlReceiver.uuid
          );
          if (!prevControlReceiver) {
            return controlReceiver;
          }
          return {
            ...controlReceiver,
            failed_sent_responses: setCriticalIndicatorNumber(
              prevControlReceiver.failed_sent_responses,
              controlReceiver.failed_sent_responses
            ),
            failed_sent_status_messages: setCriticalIndicatorNumber(
              prevControlReceiver.failed_sent_status_messages,
              controlReceiver.failed_sent_status_messages
            )
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title)),
      outputs: apiMonitoring.outputs
        .map((output) => {
          const prevOutput = prevMonitoring.outputs.find(
            (o) => o.uuid === output.uuid
          );
          if (!prevOutput) {
            return output;
          }
          return {
            ...output,
            active_streams: output.active_streams?.map((stream) => {
              const prevStream = prevOutput.active_streams.find(
                (s) => s.id === stream.id
              );
              if (!prevStream) {
                return stream;
              }
              if (
                !prevStream.failed_encoded_audio_frames ||
                !stream.failed_encoded_audio_frames
              )
                throw new Error(
                  'Error prevStream - failed_encoded_video_frames'
                );
              if (
                !prevStream.failed_encoded_video_frames ||
                !stream.failed_encoded_video_frames
              )
                throw new Error(
                  'Error prevStream - failed_encoded_video_frames'
                );
              return {
                ...stream,
                failed_encoded_audio_frames: setCriticalIndicatorNumber(
                  prevStream.failed_encoded_audio_frames,
                  stream.failed_encoded_audio_frames
                ),
                failed_encoded_video_frames: setCriticalIndicatorNumber(
                  prevStream.failed_encoded_video_frames,
                  stream.failed_encoded_video_frames
                ),
                clients: stream.clients?.map((client) => {
                  if (!prevStream.clients) {
                    return client;
                  }
                  if (prevStream.clients.length > 0) {
                    const prevClient = prevStream.clients.find(
                      (c) => c.ip === client.ip
                    );
                    if (!prevClient) {
                      return client;
                    }
                    return {
                      ...client,
                      retransmitted_packets: setCriticalIndicatorNumber(
                        prevClient.retransmitted_packets,
                        client.retransmitted_packets
                      )
                    };
                  }
                  return client;
                })
              };
            })
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title)),
      multiviews: apiMonitoring.multiviews
        .map((multiview) => {
          const prevMultiview = prevMonitoring.multiviews.find(
            (m) => m.uuid === multiview.uuid
          );
          if (!prevMultiview) {
            return multiview;
          }
          if (!prevMultiview.mpeg_ts_srt.failed_encoded_audio_frames)
            throw new Error('No failed_encoded_audio_frames');
          if (!multiview.mpeg_ts_srt.failed_encoded_audio_frames)
            throw new Error('No failed_encoded_audio_frames');
          if (!prevMultiview.mpeg_ts_srt.failed_encoded_video_frames)
            throw new Error('No failed_encoded_video_frames');
          if (!multiview.mpeg_ts_srt.failed_encoded_video_frames)
            throw new Error('No failed_encoded_video_frames');
          return {
            ...multiview,
            failed_rendered_frames: setCriticalIndicatorNumber(
              prevMultiview.failed_rendered_frames,
              multiview.failed_rendered_frames
            ),
            mpeg_ts_srt: {
              ...multiview.mpeg_ts_srt,
              failed_encoded_audio_frames: setCriticalIndicatorNumber(
                prevMultiview.mpeg_ts_srt.failed_encoded_audio_frames,
                multiview.mpeg_ts_srt.failed_encoded_audio_frames
              ),
              failed_encoded_video_frames: setCriticalIndicatorNumber(
                prevMultiview.mpeg_ts_srt.failed_encoded_video_frames,
                multiview.mpeg_ts_srt.failed_encoded_video_frames
              ),
              clients: multiview.mpeg_ts_srt.clients?.map((client) => {
                const prevClient = prevMultiview.mpeg_ts_srt.clients?.find(
                  (c) => c.ip === client.ip
                );
                if (!prevClient) {
                  return client;
                }
                return {
                  ...client,
                  retransmitted_packets: setCriticalIndicatorNumber(
                    prevClient.retransmitted_packets,
                    client.retransmitted_packets
                  )
                };
              })
            }
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title))
    } as Monitoring;
    nextMonitoring.productionErrors = getProductionError(nextMonitoring);

    return nextMonitoring;
  }
}

/**
 * Syncs the Monitoring DB with all the active productions and compares with data in Ateliere Live.
 */
export async function runSyncMonitoring() {
  const db = await getDatabase();
  // Fetch all active productions from the database
  const productions = await db
    .collection<Production>('productions')
    .find({ isActive: true })
    .toArray();

  try {
    productions.forEach(async (production) => {
      // Fetch the current monitoring object from the database
      const currentMonitoring = await db
        .collection<Monitoring>('monitoring')
        .findOne({ productionId: production._id.toString() });

      if (!currentMonitoring) {
        Log().info(
          'Missing monitoring object in database for production: ' +
            production.name
        );
        // We can't create a monitoring object here, only the thread that starts an productions is allowed to do that.
        return;
      }

      try {
        const updatedMonitoringData = await updatedMonitoringForProduction(
          currentMonitoring,
          production
        );
        await db
          .collection('monitoring')
          .findOneAndReplace(
            { _id: currentMonitoring._id },
            updatedMonitoringData
          );
      } catch (error) {
        Log().error(
          'Monitoring sync failed for production: ' +
            production.name +
            ', ' +
            error
        );
      }
    });
  } catch (e) {
    Log().error('Monitoring sync failed');
    throw 'monitoring_sync';
  }
}
//HELPER FUNCTIONS - this can be moved to a util folder.
const createStreams = (
  ingests: ResourcesIngestResponse[],
  missing: string[],
  pipelines: ResourcesPipelineResponse[],
  prevMonitoring?: Monitoring
) => {
  const missingStreams = prevMonitoring?.streams.filter((stream) =>
    missing.includes(stream.ingestUuid)
  );
  if (!prevMonitoring) {
    return getInitialStreams(ingests, pipelines);
  }
  if (missingStreams && missingStreams.length > 0) {
    const nextMissingStreams = setMissingStreamsErrors(
      missingStreams,
      prevMonitoring
    );
    const existingIngests = ingests.filter(
      (ingest) => !missing.includes(ingest.uuid)
    );
    const incomingExistingStreams = getInitialStreams(
      existingIngests,
      pipelines
    );
    const nextExistingStreams = getNextStream(
      prevMonitoring,
      incomingExistingStreams
    );
    return [...nextMissingStreams, ...nextExistingStreams];
  }
  const incomingMonitoringStream = getInitialStreams(ingests, pipelines);
  return getNextStream(prevMonitoring, incomingMonitoringStream);
};
//Check if we have any error to bubble it up to each level.
const getProductionError = (monitoring: Monitoring) => {
  const findMonitoringErrors = () => {
    const sourcesError = () => {
      let hasAnySourcesError = false;
      const sourcesWithErrors: string[] = [];
      monitoring.sources.length > 0 &&
        monitoring.sources.map((source) => {
          if (sourceHasErrors(source)) {
            hasAnySourcesError = true;
            sourcesWithErrors.push(source.source_id);
          }
        });
      return {
        error: hasAnySourcesError,
        sourcesWithErrors: sourcesWithErrors
      };
    };
    const sourceHasErrors = (source: MonitoringSourcesResponse) => {
      let error = false;
      if (source.active.has_error) {
        error = true;
        return error;
      }
      if (source.lost_audio_frames.has_error) {
        error = true;
        return error;
      }
      if (source.lost_video_frames.has_error) {
        error = true;
        return error;
      }
      return error;
    };
    const streamsErrors = () => {
      let hasAnyStreamsError = false;
      const streamsWithErrors: string[] = [];
      monitoring.streams.length > 0 &&
        monitoring.streams.map((stream) => {
          if (streamHasErrors(stream)) {
            hasAnyStreamsError = true;
            streamsWithErrors.push(stream.title);
          }
        });
      return {
        error: hasAnyStreamsError,
        streamsWithErrors: streamsWithErrors
      };
    };
    const streamHasErrors = (stream: MonitoringStreamResponse) => {
      let result = false;
      if (stream.ingestSide.dropped_video_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.ingestSide.failed_encoded_audio_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.ingestSide.failed_encoded_video_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.ingestSide.failed_sent_audio_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.ingestSide.failed_sent_video_frames.has_error) {
        result = true;
        return result;
      }
      stream.ingestSide.interfaces.length > 0 &&
        stream.ingestSide.interfaces.map((iFace) => {
          if (iFace.retransmitted_packets.has_error) {
            result = true;
            return result;
          }
        });
      if (stream.pipelineSide.received_broken_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.pipelineSide.lost_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.pipelineSide.failed_decoded_audio_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.pipelineSide.failed_decoded_video_frames.has_error) {
        result = true;
        return result;
      }
      if (stream.pipelineSide.dropped_frames.has_error) {
        result = true;
        return result;
      }
      stream.pipelineSide.interfaces.length > 0 &&
        stream.pipelineSide.interfaces.map((iFace) => {
          if (iFace.lost_packets.has_error) {
            result = true;
            return result;
          }
          if (iFace.dropped_packets.has_error) {
            result = true;
            return result;
          }
        });
      return result;
    };
    const outputErrors = () => {
      let hasAnyOuputsError = false;
      const outputsWithErrors: string[] = [];
      monitoring.outputs.length > 0 &&
        monitoring.outputs.map((output) => {
          if (outputHasErrors(output)) {
            hasAnyOuputsError = true;
            outputsWithErrors.push(output.uuid);
          }
        });
      return {
        error: hasAnyOuputsError,
        outputsWithErrors: outputsWithErrors
      };
    };
    const outputHasErrors = (output: MonitoringOutputStatusResponse) => {
      return (
        output.active_streams !== undefined &&
        output.active_streams.length > 0 &&
        output.active_streams.some((stream) => {
          if (
            stream.failed_encoded_audio_frames &&
            stream.failed_encoded_audio_frames.has_error
          ) {
            return true;
          }
          if (
            stream.failed_encoded_video_frames &&
            stream.failed_encoded_video_frames.has_error
          ) {
            return true;
          }
          return (
            stream?.clients &&
            stream.clients.length > 0 &&
            stream.clients.some((client) => {
              return client.retransmitted_packets.has_error;
            })
          );
        })
      );
    };
    const multiviewErrors = () => {
      let hasAnyMultiviewsError = false;
      const multiviewsWithErrors: string[] = [];
      monitoring.multiviews.length > 0 &&
        monitoring.multiviews.map((multiview) => {
          if (multiviewHasErrors(multiview)) {
            hasAnyMultiviewsError = true;
            multiviewsWithErrors.push(multiview.title);
          }
        });
      return {
        error: hasAnyMultiviewsError,
        multiviewsWithErrors: multiviewsWithErrors
      };
    };
    const multiviewHasErrors = (
      multiview: MonitoringMultiviewOutputResponse
    ) => {
      let result = false;
      if (
        multiview.mpeg_ts_srt.failed_encoded_audio_frames &&
        multiview.mpeg_ts_srt.failed_encoded_audio_frames.has_error
      ) {
        result = true;
        return result;
      }
      if (
        multiview.mpeg_ts_srt.failed_encoded_video_frames &&
        multiview.mpeg_ts_srt.failed_encoded_video_frames.has_error
      ) {
        result = true;
        return result;
      }
      multiview.mpeg_ts_srt.clients &&
        multiview.mpeg_ts_srt.clients.length > 0 &&
        multiview.mpeg_ts_srt.clients?.map((client) => {
          if (client.retransmitted_packets.has_error) {
            result = true;
            return result;
          }
        });
      return result;
    };

    const componentControlPanelErrors = () => {
      let hasAnyControlPanelsError = false;
      const controlPanelsWithErrors: string[] = [];
      monitoring.productionComponents.controlPanels.length > 0 &&
        monitoring.productionComponents.controlPanels.map((controlPanel) => {
          if (controlPanel.active.has_error) {
            hasAnyControlPanelsError = true;
            controlPanelsWithErrors.push(controlPanel.controlPanelUuid);
          }
        });
      return {
        error: hasAnyControlPanelsError,
        controlPanelsErrors: controlPanelsWithErrors
      };
    };

    const ingestErrors = () => {
      let hasAnyIngestError = false;
      const ingestWithErrors: string[] = [];
      monitoring.productionComponents.ingests.length > 0 &&
        monitoring.productionComponents.ingests.map((ingest) => {
          if (ingest.active.has_error) {
            hasAnyIngestError = true;
            ingestWithErrors.push(ingest.ingestUuid);
          }
        });
      return {
        error: hasAnyIngestError,
        ingestErrors: ingestWithErrors
      };
    };

    const pipelineErrors = () => {
      let hasAnyPipelineError = false;
      const pipelineWithErrors: string[] = [];
      monitoring.productionComponents.pipelines.length > 0 &&
        monitoring.productionComponents.pipelines.map((pipeline) => {
          if (pipeline.active.has_error) {
            hasAnyPipelineError = true;
            pipelineWithErrors.push(pipeline.pipelineUuid);
          }
        });
      return {
        error: hasAnyPipelineError,
        pipelineErrors: pipelineWithErrors
      };
    };

    const controlPanelErrors = () => {
      let hasAnyControlPanelsError = false;
      const controlPanelsWithErrors: string[] = [];
      monitoring.controlPanels.length > 0 &&
        monitoring.controlPanels.map((controlPanel) => {
          if (controlPanelHasError(controlPanel)) {
            hasAnyControlPanelsError = true;
            controlPanelsWithErrors.push(controlPanel.title);
          }
        });
      return {
        error: hasAnyControlPanelsError,
        controlPanelsWithErrors: controlPanelsWithErrors
      };
    };
    const controlPanelHasError = (
      controlPanel: MonitoringControlPanelStatusResponse
    ) => {
      let result = false;
      if (controlPanel.failed_sent_requests.has_error) {
        result = true;
        return result;
      }
      controlPanel.connected_to.length > 0 &&
        controlPanel.connected_to.map((connected_to) => {
          if (connected_to.received_broken.has_error) {
            result = true;
            return result;
          }
        });
      return result;
    };
    const controlReceiverErrors = () => {
      let hasAnyControlReceiverError = false;
      const controlReceiversWithErrors: string[] = [];
      monitoring.controlReceivers.length > 0 &&
        monitoring.controlReceivers.map((controlReceiver) => {
          if (controlReceiverHasError(controlReceiver)) {
            hasAnyControlReceiverError = true;
            controlReceiversWithErrors.push(controlReceiver.title);
          }
        });
      return {
        error: hasAnyControlReceiverError,
        controlReceiversWithErrors: controlReceiversWithErrors
      };
    };
    const controlReceiverHasError = (
      controlReceiver: MonitoringControlReceiverStatusResponse
    ) => {
      let result = false;
      if (controlReceiver.failed_sent_requests.has_error) {
        result = true;
        return result;
      }
      if (controlReceiver.failed_sent_responses.has_error) {
        result = true;
        return result;
      }
      if (controlReceiver.failed_sent_status_messages.has_error) {
        result = true;
        return result;
      }
      controlReceiver.connected_to.length > 0 &&
        controlReceiver.connected_to.map((connected_to) => {
          if (connected_to.received_broken.has_error) {
            result = true;
            return result;
          }
        });
      if (controlReceiver.connected_sender) {
        controlReceiver.connected_sender.length > 0 &&
          controlReceiver.connected_sender.map((connected_sender) => {
            if (connected_sender.received_broken.has_error) {
              result = true;
              return result;
            }
          });
      }
      return result;
    };
    return {
      productionComponents: {
        error:
          ingestErrors().error ||
          pipelineErrors().error ||
          componentControlPanelErrors().error,
        ingestErrors: ingestErrors().ingestErrors,
        pipelineErrors: pipelineErrors().pipelineErrors,
        controlPanelsErrors: componentControlPanelErrors().controlPanelsErrors
      },
      sources: sourcesError(),
      streams: streamsErrors(),
      outputs: outputErrors(),
      multiviews: multiviewErrors(),
      controlPanels: controlPanelErrors(),
      controlReceivers: controlReceiverErrors()
    };
  };
  const monitoringErrors = findMonitoringErrors();
  return {
    anyError:
      monitoringErrors.productionComponents.error ||
      monitoringErrors.sources.error ||
      monitoringErrors.streams.error ||
      monitoringErrors.outputs.error ||
      monitoringErrors.multiviews.error ||
      monitoringErrors.controlPanels.error ||
      monitoringErrors.controlReceivers.error,
    productionComponentsErrors: monitoringErrors.productionComponents,
    sourcesErrors: monitoringErrors.sources,
    streamsErrors: monitoringErrors.streams,
    outputsErrors: monitoringErrors.outputs,
    multiviewsErrors: monitoringErrors.multiviews,
    controlPanelsErrors: monitoringErrors.controlPanels,
    controlReceiversErrors: monitoringErrors.controlReceivers
  } as ProductionErrors;
};
const createMonitoringMultiviews = (pipelines: ResourcesPipelineResponse[]) => {
  return pipelines.flatMap((pipeline) => {
    return pipeline.multiviews.map((multiview) => {
      return {
        title: pipeline.name + ' multiview ID: ' + multiview.id,
        uuid: pipeline.name + multiview.id,
        failed_rendered_frames: {
          value: multiview.output.failed_rendered_frames,
          has_error: false,
          last_modified: new Date()
        },
        rendered_frames: multiview.output.rendered_frames,
        mpeg_ts_srt: {
          clients:
            multiview.output.mpeg_ts_srt &&
            multiview.output.mpeg_ts_srt.clients.length > 0
              ? multiview.output.mpeg_ts_srt.clients.map((client) => {
                  return {
                    bandwidth_bps: client.bandwidth_bps,
                    ip: client.ip,
                    port: client.port,
                    retransmitted_packets: {
                      value: client.retransmitted_packets,
                      has_error: false,
                      last_modified: new Date()
                    },
                    sent_bytes: client.sent_bytes,
                    sent_packets: client.sent_packets
                  } as MonitoringOutputActiveStreamMpegTsSrt;
                })
              : [],
          encoded_audio_frames:
            multiview.output.mpeg_ts_srt?.encoded_audio_frames,
          encoded_video_frames:
            multiview.output.mpeg_ts_srt?.encoded_video_frames,
          failed_encoded_audio_frames: multiview.output.mpeg_ts_srt && {
            value: multiview.output.mpeg_ts_srt.failed_encoded_audio_frames,
            has_error: false,
            last_modified: new Date()
          },
          failed_encoded_video_frames: multiview.output.mpeg_ts_srt && {
            value: multiview.output.mpeg_ts_srt.failed_encoded_video_frames,
            has_error: false,
            last_modified: new Date()
          },
          muxed_audio_frames: multiview.output.mpeg_ts_srt?.muxed_audio_frames,
          muxed_video_frames: multiview.output.mpeg_ts_srt?.muxed_video_frames
        }
      };
    });
  }) as MonitoringMultiviewOutputResponse[];
};

const createMonitoringSources = (
  ingests: ResourcesIngestResponse[],
  missing: string[],
  prevMonitoring?: Monitoring
) => {
  const missingSources = prevMonitoring?.sources.filter((source) =>
    missing.includes(source.ingestUuid)
  );
  if (!prevMonitoring) {
    return getInitialSources(ingests);
  }
  if (missingSources && missingSources.length > 0) {
    const nextMissingSources = setMissingSourcesErrors(
      missingSources,
      prevMonitoring
    );
    const existingIngests = ingests.filter(
      (ingest) => !missing.includes(ingest.uuid)
    );
    const incomingExistingSources = getInitialSources(existingIngests);
    const nextExistingSources = getNextSources(
      prevMonitoring,
      incomingExistingSources
    );
    return [...nextMissingSources, ...nextExistingSources];
  }
  const incomingMonitoringSources = getInitialSources(ingests);
  return getNextSources(prevMonitoring, incomingMonitoringSources);
};
const createMonitoringIngests = async (
  ingestIds: string[],
  prevMonitoring?: Monitoring
) => {
  const ingests = await getIngests();
  const ingestUuids = ingests.map((i) => i.uuid);
  if (!prevMonitoring) {
    const ingestsProduction = ingests.filter((i) => ingestIds.includes(i.uuid));
    return ingestsProduction.map((i) => ({
      title: i.name,
      ingestUuid: i.uuid,
      active: {
        value: true,
        has_error: false,
        last_modified: new Date()
      }
    }));
  }
  const missingIngestIds = prevMonitoring.productionComponents.ingests
    .map((i) => i.ingestUuid)
    .filter((i) => !ingestUuids.includes(i));

  const nextIngests = prevMonitoring.productionComponents.ingests.map(
    (monitoringIngest) => {
      if (missingIngestIds.includes(monitoringIngest.ingestUuid)) {
        return {
          ...monitoringIngest,
          active: {
            value: false,
            has_error: true,
            last_modified: new Date()
          }
        };
      }
      return {
        ...monitoringIngest,
        active: {
          ...monitoringIngest.active,
          value: true,
          has_error: false
        }
      };
    }
  );
  return nextIngests;
};

const createMonitoringPipelines = async (
  pipelines: ResourcesPipelineResponse[],
  prevMonitoring?: Monitoring
) => {
  if (!prevMonitoring) {
    return pipelines.map((p) => ({
      title: p.name,
      pipelineUuid: p.uuid,
      active: {
        value: true,
        has_error: false,
        last_modified: new Date()
      }
    }));
  }
  const pipelineUuids = (await getPipelines()).map((p) => p.uuid);
  const missingPipelines = prevMonitoring.productionComponents.pipelines
    .map((p) => p.pipelineUuid)
    .filter((p) => !pipelineUuids.includes(p));
  const nextPipelines = prevMonitoring.productionComponents.pipelines.map(
    (monitoringPipeline) => {
      if (missingPipelines.includes(monitoringPipeline.pipelineUuid)) {
        return {
          ...monitoringPipeline,
          active: {
            value: false,
            has_error: true,
            last_modified: new Date()
          }
        } satisfies MonitoringPipelinesResponse;
      }
      return {
        ...monitoringPipeline,
        active: {
          ...monitoringPipeline.active,
          value: true,
          has_error: false
        }
      } satisfies MonitoringPipelinesResponse;
    }
  );
  return nextPipelines;
};

const createMonitoringOutputs = (pipelines: ResourcesPipelineResponse[]) => {
  return pipelines.flatMap((pipeline) => {
    // Start by filtering out the outputs that are not active
    // (no output stream is started on the output)
    return pipeline.outputs
      .filter((output) => {
        return output.active_streams !== null;
      })
      .map((output) => {
        return {
          title: pipeline.name + ': ' + output.name,
          uuid: output.uuid,
          active_streams: output.active_streams?.map((activeStream) => {
            return {
              id: activeStream.id,
              clients: activeStream.mpeg_ts_srt?.clients.map((client) => {
                return {
                  bandwidth_bps: client.bandwidth_bps,
                  ip: client.ip,
                  port: client.port,
                  retransmitted_packets: {
                    value: client.retransmitted_packets,
                    has_error: false,
                    last_modified: new Date()
                  },
                  sent_bytes: client.sent_bytes,
                  sent_packets: client.sent_packets
                } as ResourcesOutputSrtClient;
              }),
              encoded_audio_frames:
                activeStream.mpeg_ts_srt?.encoded_audio_frames,
              encoded_video_frames:
                activeStream.mpeg_ts_srt?.encoded_video_frames,
              failed_encoded_audio_frames: {
                value: activeStream.mpeg_ts_srt?.failed_encoded_audio_frames,
                has_error: false,
                last_modified: new Date()
              },
              failed_encoded_video_frames: {
                value: activeStream.mpeg_ts_srt?.failed_encoded_video_frames,
                has_error: false,
                last_modified: new Date()
              },
              muxed_audio_frames: activeStream.mpeg_ts_srt?.muxed_audio_frames,
              muxed_video_frames: activeStream.mpeg_ts_srt?.muxed_video_frames
            };
          }),
          lost_frames: output.lost_frames,
          received_audio_frames: output.received_audio_frames,
          received_frames: output.received_frames,
          received_video_frames: output.received_video_frames
        } as MonitoringOutputStatusResponse;
      });
  });
};
const getReceivedRequestCount = (
  receivedRequests: ResourcesControlRequestCounter[],
  receiver: ResourcesReceiverNetworkEndpoint
) => {
  if (receivedRequests.length > 0) {
    const foundReceivedRequest = receivedRequests.find(
      (request) => request.sender_uuid === receiver.sender_uuid
    );
    if (foundReceivedRequest) {
      return foundReceivedRequest.count;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};
const getRequestResponsesCount = (
  requestResponses: ResourcesControlResponseCounter[],
  sender: ResourcesSenderNetworkEndpoint
) => {
  if (requestResponses.length > 0) {
    const foundRequestResponse = requestResponses.find(
      (request) => request.respondent_uuid === sender.receiver_uuid
    );
    if (foundRequestResponse) {
      return foundRequestResponse.count;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};
const getControlPanelStatusMessagesCount = (
  controlStatusMessageCounters: ResourcesControlStatusMessageCounter[]
) => {
  let count = 0;
  if (controlStatusMessageCounters.length > 0) {
    controlStatusMessageCounters.map((counter) => {
      count = count + counter.count;
    });
  }
  return count;
};
const getControlPanelRequestResponsesCount = (
  responseCounters: ResourcesControlResponseCounter[]
) => {
  let count = 0;
  if (responseCounters.length > 0) {
    responseCounters.map((counter) => {
      count = count + counter.count;
    });
  }
  return count;
};
const createMonitoringControlReceiver = (
  controlPanels: ResourcesControlPanelResponse[],
  pipelines: ResourcesPipelineResponse[]
) => {
  // Since a receiver can be getting connctions from both control panels and pipelines
  // create a lookup dictionary with uuid:name of all control panels and pipelines.
  const uuidToName = Object.fromEntries(
    controlPanels.map((cp) => [cp.uuid, cp.name])
  );
  pipelines.forEach((pipeline) => {
    uuidToName[pipeline.uuid] = pipeline.name;
  });

  return pipelines.map((pipeline) => {
    const controlReceiver = pipeline.control_receiver;
    return {
      title: pipeline.name,
      uuid: pipeline.uuid,
      delivered_requests: controlReceiver.delivered_requests,
      failed_sent_requests: {
        value: controlReceiver.failed_sent_requests,
        has_error: false,
        last_modified: new Date()
      },
      failed_sent_responses: {
        value: controlReceiver.failed_sent_responses,
        has_error: false,
        last_modified: new Date()
      },
      failed_sent_status_messages: {
        value: controlReceiver.failed_sent_status_messages,
        has_error: false,
        last_modified: new Date()
      },
      requests_in_queue: pipeline.control_receiver.requests_in_queue,
      sent_requests: controlReceiver.sent_requests,
      sent_responses: controlReceiver.sent_responses,
      sent_status_messages: controlReceiver.sent_status_messages,
      connected_sender: controlReceiver.incoming_connections.map((sender) => {
        return {
          uuid: sender.sender_uuid,
          name: uuidToName[sender.sender_uuid],
          ip: sender.remote_ip,
          port: sender.remote_port,
          received_broken: {
            value: sender.received_broken,
            has_error: false,
            last_modified: new Date()
          },
          received_request_count: getReceivedRequestCount(
            controlReceiver.received_requests,
            sender
          )
        };
      }),
      connected_to: controlReceiver.outgoing_connections.map((receiver) => {
        return {
          uuid: receiver.connection_uuid,
          name: uuidToName[receiver.receiver_uuid],
          ip: receiver.remote_ip,
          port: receiver.remote_port,
          received_broken: {
            value: receiver.received_broken,
            has_error: false,
            last_modified: new Date()
          },
          received_responses_count: getRequestResponsesCount(
            controlReceiver.request_responses,
            receiver
          )
        };
      })
    };
  }) as MonitoringControlReceiverStatusResponse[];
};

const setCriticalIndicatorNumber = (
  previous: CriticalIndicator<number>,
  next: CriticalIndicator<number>
) => {
  const hasLastModifiedOlderThan60s = (previousLastModified: Date) => {
    const now = new Date().getTime();
    const errorTimer = new Date(previousLastModified).getTime() + 60 * 1000;
    if (now >= errorTimer) {
      return true;
    }
    return false;
  };
  if (previous.has_error) {
    if (
      previous.value === next.value &&
      hasLastModifiedOlderThan60s(previous.last_modified)
    ) {
      return {
        ...next,
        has_error: false
      };
    } else if (previous.value === next.value) {
      return {
        ...next,
        has_error: true,
        last_modified: previous.last_modified
      };
    }
  }
  if (previous.value < next.value) {
    return { ...next, has_error: true };
  }
  return next;
};
const setCriticalIndicatorBoolean = (
  previous: CriticalIndicator<boolean>,
  next: CriticalIndicator<boolean>
) => {
  const hasLastModifiedOlderThan60s = (previousLastModified: Date) => {
    const now = new Date().getTime();
    const errorTimer = new Date(previousLastModified).getTime() + 60 * 1000;
    if (now >= errorTimer) {
      return true;
    }
    return false;
  };

  if (previous.has_error) {
    if (
      next.value === true &&
      hasLastModifiedOlderThan60s(previous.last_modified)
    ) {
      return { ...next, has_error: false };
    }
    return { ...next, has_error: true, last_modified: previous.last_modified };
  }
  if (next.value === false) {
    return { ...next, has_error: true };
  }
  return next;
};

const createMonitoringComponentControlPanels = async (
  controlPanels: ResourcesControlPanelResponse[],
  pipelines: ResourcesPipelineResponse[],
  production: Production,
  prevMonitoring?: Monitoring
) => {
  const pipelineIndex =
    production.production_settings.control_connection.control_panel_endpoint
      .toPipelineIdx;

  const pipelineId =
    production.production_settings.pipelines[pipelineIndex].pipeline_id;

  const pipeline = pipelines.find((p) => p.uuid === pipelineId);

  const controlPanelsForProduction = controlPanels.filter((controlPanel) =>
    controlPanel.outgoing_connections.some(
      (connectedTo) => pipeline?.uuid == connectedTo.receiver_uuid
    )
  );

  if (!prevMonitoring) {
    return controlPanelsForProduction.map((c) => ({
      title: c.name,
      controlPanelUuid: c.uuid,
      active: {
        value: true,
        has_error: false,
        last_modified: new Date()
      }
    })) satisfies MonitoringControlPanelResponse[];
  }

  const controlPanelUids = controlPanels.map((c) => c.uuid);
  const missingControlPanels = prevMonitoring.productionComponents.controlPanels
    .map((c) => c.controlPanelUuid)
    .filter((p) => !controlPanelUids.includes(p));
  const nextControlPanels =
    prevMonitoring.productionComponents.controlPanels.map(
      (monitoringControlPanel) => {
        if (
          missingControlPanels.includes(monitoringControlPanel.controlPanelUuid)
        ) {
          return {
            ...monitoringControlPanel,
            active: {
              value: false,
              has_error: true,
              last_modified: new Date()
            }
          } satisfies MonitoringControlPanelResponse;
        }
        return {
          ...monitoringControlPanel,
          active: {
            ...monitoringControlPanel.active,
            value: true,
            has_error: false
          }
        } satisfies MonitoringControlPanelResponse;
      }
    );
  return nextControlPanels;
};

const createMonitoringControlPanels = async (
  controlPanels: ResourcesControlPanelResponse[],
  production: Production,
  pipelines: ResourcesPipelineResponse[]
) => {
  const pipelineIndex =
    production.production_settings.control_connection.control_panel_endpoint
      .toPipelineIdx;

  const pipelineId =
    production.production_settings.pipelines[pipelineIndex].pipeline_id;

  const pipeline = pipelines.find((p) => p.uuid === pipelineId);

  const controlPanelsForProduction = controlPanels.filter((controlPanel) =>
    controlPanel.outgoing_connections.some(
      (connectedTo) => pipeline?.uuid == connectedTo.receiver_uuid
    )
  );

  const monitoringControlPanels = controlPanelsForProduction
    .map((controlPanel) => {
      return {
        title: controlPanel.name,
        uuid: controlPanel.uuid,
        connected_to:
          controlPanel.outgoing_connections.length > 0
            ? controlPanel.outgoing_connections.map((connection) => {
                return {
                  name: pipeline?.name,
                  connection_uuid: connection.connection_uuid,
                  ip: connection.remote_ip,
                  port: connection.remote_port,
                  received_broken: {
                    value: connection.received_broken,
                    has_error: false,
                    last_modified: new Date()
                  },
                  //For now this is implemented as is - in the future match uuids.
                  received_status_messages_count:
                    getControlPanelStatusMessagesCount(
                      controlPanel.received_status_messages
                    ),
                  request_responses_count: getControlPanelRequestResponsesCount(
                    controlPanel.request_responses
                  )
                };
              })
            : [],
        failed_sent_requests: {
          value: controlPanel.failed_sent_requests,
          has_error: false,
          last_modified: new Date()
        },
        sent_requests: controlPanel.sent_requests
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  return monitoringControlPanels as MonitoringControlPanelStatusResponse[];
};
const pipelinesForProduction = (pipelines: string[]) => {
  const promises = pipelines.map(async (pipeline) => {
    try {
      return await getPipeline(pipeline);
    } catch (error) {
      Log().error('Failed to get pipeline for monitoring sync: ', error);
    }
  });

  return Promise.all(promises);
};
const getIngestsForProduction = async (
  ingestUuids: string[],
  sourceAndIngestIds: string[]
) => {
  const ingestForProduction = async (uuids: (string | undefined)[]) => {
    const promises = uuids.map(async (uuid) => {
      return getIngest(uuid as string);
    });
    return await Promise.allSettled(promises);
  };
  const ingestsResults = await ingestForProduction(ingestUuids);

  const existingIngests = ingestsResults.flatMap((result) => {
    if (result.status === 'fulfilled' && result.value !== undefined) {
      const activeSources = result.value.sources.filter((source) => {
        return sourceAndIngestIds.includes(
          source.source_id + result.value.uuid
        );
      });
      return {
        ...result.value,
        sources: activeSources
      } as ResourcesIngestResponse;
    }
    return [];
  });

  const existingIngestIds = existingIngests.map((ingest) => ingest?.uuid);
  const missingIngestsUuids = ingestUuids.filter(
    (uuid) => !existingIngestIds.includes(uuid)
  );

  return { ingests: existingIngests, missing: missingIngestsUuids };
};
const setMissingStreamsErrors = (
  missingStreams: MonitoringStreamResponse[],
  prevMonitoring: Monitoring
) => {
  return missingStreams.map((stream) => {
    const prevStream = prevMonitoring?.streams.find(
      (prevStream) => prevStream.title === stream.title
    );
    if (!prevStream) {
      return stream;
    }
    return {
      ...stream,
      ingestSide: {
        ...stream.ingestSide,
        dropped_video_frames: {
          value: prevStream.ingestSide.dropped_video_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        failed_encoded_audio_frames: {
          value: prevStream.ingestSide.failed_encoded_audio_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        failed_encoded_video_frames: {
          value: prevStream.ingestSide.failed_encoded_video_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        failed_sent_audio_frames: {
          value: prevStream.ingestSide.failed_encoded_audio_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        failed_sent_video_frames: {
          value: prevStream.ingestSide.failed_sent_video_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        interfaces: stream.ingestSide.interfaces.map((ingestStream) => {
          const prevInterface = prevStream.ingestSide.interfaces.find(
            (prevIngestInterface) =>
              prevIngestInterface.uuid === ingestStream.uuid
          );
          if (!prevInterface) return ingestStream;
          return {
            ...ingestStream,
            retransmitted_packets: {
              value: prevInterface.retransmitted_packets.value,
              has_error: true,
              last_modified: new Date()
            }
          };
        })
      },
      pipelineSide: {
        ...stream.pipelineSide,
        received_broken_frames: {
          value: prevStream.pipelineSide.received_broken_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        lost_frames: {
          value: prevStream.pipelineSide.lost_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        failed_decoded_audio_frames: {
          value: prevStream.pipelineSide.failed_decoded_audio_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        failed_decoded_video_frames: {
          value: prevStream.pipelineSide.failed_decoded_video_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        dropped_frames: {
          value: prevStream.pipelineSide.dropped_frames.value,
          has_error: true,
          last_modified: new Date()
        },
        interfaces:
          stream.pipelineSide.interfaces.length > 0
            ? stream.pipelineSide.interfaces.map((pipelineStream) => {
                const prevInterface = prevStream.pipelineSide.interfaces.find(
                  (prevPipelineInterface) =>
                    prevPipelineInterface.uuid === pipelineStream.uuid
                );
                if (!prevInterface) {
                  return pipelineStream;
                }
                return {
                  ...pipelineStream,
                  lost_packets: {
                    value: prevInterface.lost_packets.value,
                    has_error: true,
                    last_modified: new Date()
                  },
                  dropped_packets: {
                    value: prevInterface.dropped_packets.value,
                    has_error: true,
                    last_modified: new Date()
                  }
                };
              })
            : []
      }
    };
  });
};
const getNextStream = (
  prevMonitoring: Monitoring,
  incomingMonitoringStreams: MonitoringStreamResponse[]
) => {
  return incomingMonitoringStreams.map((stream) => {
    const prevStream = prevMonitoring.streams.find(
      (prevStream) => prevStream.title === stream.title
    );
    if (!prevStream) {
      return stream;
    }
    return {
      ...stream,
      ingestSide: {
        ...stream.ingestSide,
        dropped_video_frames: setCriticalIndicatorNumber(
          prevStream.ingestSide.dropped_video_frames,
          stream.ingestSide.dropped_video_frames
        ),
        failed_encoded_audio_frames: setCriticalIndicatorNumber(
          prevStream.ingestSide.failed_encoded_audio_frames,
          stream.ingestSide.failed_encoded_audio_frames
        ),
        failed_encoded_video_frames: setCriticalIndicatorNumber(
          prevStream.ingestSide.failed_encoded_video_frames,
          stream.ingestSide.failed_encoded_video_frames
        ),
        failed_sent_audio_frames: setCriticalIndicatorNumber(
          prevStream.ingestSide.failed_sent_audio_frames,
          stream.ingestSide.failed_sent_audio_frames
        ),
        failed_sent_video_frames: setCriticalIndicatorNumber(
          prevStream.ingestSide.failed_sent_video_frames,
          stream.ingestSide.failed_sent_video_frames
        ),
        interfaces: stream.ingestSide.interfaces.map((ingestStream) => {
          const prevInterface = prevStream.ingestSide.interfaces.find(
            (prevIngestInterface) =>
              prevIngestInterface.uuid === ingestStream.uuid
          );
          if (!prevInterface) return ingestStream;
          return {
            ...ingestStream,
            retransmitted_packets: setCriticalIndicatorNumber(
              prevInterface.retransmitted_packets,
              ingestStream.retransmitted_packets
            )
          };
        })
      },
      pipelineSide: {
        ...stream.pipelineSide,
        received_broken_frames: setCriticalIndicatorNumber(
          prevStream.pipelineSide.received_broken_frames,
          stream.pipelineSide.received_broken_frames
        ),
        lost_frames: setCriticalIndicatorNumber(
          prevStream.pipelineSide.lost_frames,
          stream.pipelineSide.lost_frames
        ),
        failed_decoded_audio_frames: setCriticalIndicatorNumber(
          prevStream.pipelineSide.failed_decoded_audio_frames,
          stream.pipelineSide.failed_decoded_audio_frames
        ),
        failed_decoded_video_frames: setCriticalIndicatorNumber(
          prevStream.pipelineSide.failed_decoded_video_frames,
          stream.pipelineSide.failed_decoded_video_frames
        ),
        dropped_frames: setCriticalIndicatorNumber(
          prevStream.pipelineSide.dropped_frames,
          stream.pipelineSide.dropped_frames
        ),
        interfaces:
          stream.pipelineSide.interfaces.length > 0
            ? stream.pipelineSide.interfaces.map((pipelineStream) => {
                const prevInterface = prevStream.pipelineSide.interfaces.find(
                  (prevPipelineInterface) =>
                    prevPipelineInterface.uuid === pipelineStream.uuid
                );
                if (!prevInterface) {
                  return pipelineStream;
                }
                return {
                  ...pipelineStream,
                  lost_packets: setCriticalIndicatorNumber(
                    prevInterface.lost_packets,
                    pipelineStream.lost_packets
                  ),
                  dropped_packets: setCriticalIndicatorNumber(
                    prevInterface.dropped_packets,
                    pipelineStream.dropped_packets
                  )
                };
              })
            : []
      }
    };
  });
};

const getInitialStreams = (
  ingests: ResourcesIngestResponse[],
  pipelines: ResourcesPipelineResponse[]
) => {
  return ingests.flatMap((ingest) => {
    return ingest.streams.flatMap((ingestStream) => {
      return pipelines.flatMap((pipeline) => {
        return pipeline.streams.flatMap((pipelineStream) => {
          if (ingestStream.stream_uuid === pipelineStream.stream_uuid) {
            const source = ingest.sources.find((source) => {
              if (ingestStream.source_id === source.source_id) {
                return source;
              }
            });
            if (source) {
              return {
                title:
                  ingest.name + ': ' + source.name + ' to ' + pipeline.name,
                uuid: pipeline.uuid,
                ingestUuid: ingest.uuid,
                ingestSide: {
                  dropped_video_frames: {
                    value: ingestStream.dropped_video_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  encoded_audio_frames: ingestStream.encoded_audio_frames,
                  encoded_video_frames: ingestStream.encoded_video_frames,
                  video_frames_in_queue: ingestStream.video_frames_in_queue,
                  failed_encoded_audio_frames: {
                    value: ingestStream.failed_encoded_audio_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  failed_encoded_video_frames: {
                    value: ingestStream.failed_encoded_video_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  sent_audio_frames: ingestStream.sent_audio_frames,
                  sent_video_frames: ingestStream.sent_video_frames,
                  failed_sent_audio_frames: {
                    value: ingestStream.failed_sent_audio_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  failed_sent_video_frames: {
                    value: ingestStream.failed_encoded_video_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  video_kilobit_rate: ingestStream.video_kilobit_rate,
                  grabbed_audio_frames: ingestStream.grabbed_audio_frames,
                  grabbed_video_frames: ingestStream.grabbed_video_frames,
                  interfaces:
                    ingestStream.interfaces.length > 0
                      ? ingestStream.interfaces.map((iFace) => {
                          return {
                            uuid:
                              ingestStream.stream_uuid +
                              ingestStream.pipeline_uuid,
                            bandwidth_bps: iFace.bandwidth_bps,
                            ip: iFace.ip,
                            port: iFace.port,
                            retransmitted_packets: {
                              value: iFace.retransmitted_packets,
                              has_error: false,
                              last_modified: new Date()
                            },
                            sent_bytes: iFace.sent_bytes,
                            sent_packets: iFace.sent_packets
                          } as MonitoringStreamInterfaceIngest;
                        })
                      : []
                },
                pipelineSide: {
                  decoded_audio_frames: pipelineStream.decoded_audio_frames,
                  decoded_video_frames: pipelineStream.decoded_video_frames,
                  delivered_frames: pipelineStream.delivered_frames,
                  dropped_frames: {
                    value: pipelineStream.dropped_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  failed_decoded_audio_frames: {
                    value: pipelineStream.failed_decoded_audio_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  failed_decoded_video_frames: {
                    value: pipelineStream.failed_decoded_video_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  received_broken_frames: {
                    value: pipelineStream.received_broken_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  lost_frames: {
                    value: pipelineStream.lost_frames,
                    has_error: false,
                    last_modified: new Date()
                  },
                  received_audio_frames: pipelineStream.received_audio_frames,
                  received_video_frames: pipelineStream.received_video_frames,
                  video_frames_in_queue: pipelineStream.video_frames_in_queue,
                  interfaces:
                    pipelineStream.interfaces.length > 0
                      ? pipelineStream.interfaces.map((iFace) => {
                          return {
                            uuid:
                              pipelineStream.stream_uuid +
                              pipelineStream.ingest_uuid,
                            bandwidth_bps: iFace.bandwidth_bps,
                            dropped_packets: {
                              value: iFace.dropped_packets,
                              has_error: false,
                              last_modified: new Date()
                            },
                            lost_packets: {
                              value: iFace.lost_packets,
                              has_error: false,
                              last_modified: new Date()
                            },
                            received_bytes: iFace.received_bytes,
                            received_packets: iFace.received_packets
                          } as MonitoringStreamInterfacePipeline;
                        })
                      : []
                }
              } as MonitoringStreamResponse;
            } else {
              return [];
            }
          } else {
            return [];
          }
        });
      });
    });
  });
};

const getInitialSources = (ingests: ResourcesIngestResponse[]) => {
  return ingests.flatMap((ingest) => {
    return ingest.sources.map((source) => {
      return {
        ingestUuid: ingest.uuid,
        title: ingest.name + ': ' + source.name,
        source_id: `${source.source_id}${ingest.uuid}`,
        dropped_audio_frames: source.dropped_audio_frames,
        dropped_video_frames: source.duplicated_video_frames,
        duplicated_audio_frames: source.duplicated_audio_frames,
        duplicated_video_frames: source.duplicated_video_frames,
        lost_audio_frames: {
          value: source.lost_audio_frames,
          has_error: false,
          last_modified: new Date()
        },
        lost_video_frames: {
          value: source.lost_video_frames,
          has_error: false,
          last_modified: new Date()
        },
        active: {
          value: source.active,
          has_error: false,
          last_modified: new Date()
        }
      } satisfies MonitoringSourcesResponse as MonitoringSourcesResponse;
    });
  });
};

const setMissingSourcesErrors = (
  missingSources: MonitoringSourcesResponse[],
  prevMonitoring: Monitoring
) => {
  return missingSources.map((source) => {
    const prevSource = prevMonitoring.sources.find(
      (prevSource) => prevSource.source_id === source.source_id
    );
    if (!prevSource) {
      return source;
    }
    return {
      ...source,
      lost_audio_frames: {
        value: source.lost_audio_frames.value,
        has_error: true,
        last_modified: new Date()
      },
      lost_video_frames: {
        value: source.lost_video_frames.value,
        has_error: true,
        last_modified: new Date()
      },
      active: {
        value: source.active.value,
        has_error: true,
        last_modified: new Date()
      }
    };
  });
};
const getNextSources = (
  prevMonitoring: Monitoring,
  incomingMonitoringSources: MonitoringSourcesResponse[]
) => {
  return incomingMonitoringSources.map((source) => {
    const prevSource = prevMonitoring.sources.find(
      (prevSource) => prevSource.source_id === source.source_id
    );
    if (!prevSource) {
      return source;
    }
    return {
      ...source,
      lost_audio_frames: setCriticalIndicatorNumber(
        prevSource.lost_audio_frames,
        source.lost_audio_frames
      ),
      lost_video_frames: setCriticalIndicatorNumber(
        prevSource.lost_video_frames,
        source.lost_audio_frames
      ),
      active: setCriticalIndicatorBoolean(prevSource.active, source.active)
    };
  });
};
