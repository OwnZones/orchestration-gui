import { useCallback } from 'react';
import { ResourcesUUIDResponse } from '../../../../../types/agile-live';
import { AGILE_BASE_API_PATH } from '../../../../constants';
import {
  AddSourceResult,
  SourceToPipelineStream,
  SourceWithId
} from '../../../../interfaces/Source';
import { MultiviewSettings } from '../../../../interfaces/multiview';
import { PipelineStreamSettings } from '../../../../interfaces/pipeline';
import { Production } from '../../../../interfaces/production';
import { Result } from '../../../../interfaces/result';
import { Log } from '../../../logger';
import { getSourceIdFromSourceName, getUuidFromIngestName } from '../../ingest';
import { connectIngestToPipeline } from '../../streams';
import { getAuthorizationHeader } from '../../utils/authheader';
import {
  getAvailablePortsForIngest,
  getCurrentlyUsedPorts,
  initDedicatedPorts
} from '../../utils/fwConfigPorts';
import {
  getMultiviewsForPipeline,
  updateMultiviewForPipeline
} from '../multiviews/multiviews';
import { getPipelines } from '../pipelines';

export async function getPipelineStreams(
  pipelineUuid: string
): Promise<ResourcesUUIDResponse[]> {
  const response = await fetch(
    new URL(
      AGILE_BASE_API_PATH + `/pipelines/${pipelineUuid}/streams`,
      process.env.AGILE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.json();
}

export async function createStream(
  source: SourceWithId,
  production: Production,
  input_slot: number
): Promise<Result<AddSourceResult>> {
  const sourceToPipelineStreams: SourceToPipelineStream[] = [];
  try {
    const allPipelines = await getPipelines();
    const { production_settings } = production;
    const pipelinesToUseCompact = allPipelines.filter((pipeline) =>
      production_settings.pipelines.some((p) => p.pipeline_id === pipeline.uuid)
    );

    const usedPorts = await getCurrentlyUsedPorts(
      pipelinesToUseCompact.map((pipeline) => {
        return pipeline.uuid;
      })
    );
    const ingestUuid = await getUuidFromIngestName(
      source.ingest_name,
      false
    ).catch((error) => {
      Log().warn("Can't get UUID from Ingest name! \nError: ", error);
      throw `Could not get UUID for ingest: ${source.ingest_name}`;
    });

    const sourceId = await getSourceIdFromSourceName(
      ingestUuid,
      source.ingest_source_name,
      false
    );
    const audioMapping =
      source.audio_stream.audio_mapping &&
      source.audio_stream.audio_mapping.length > 0
        ? source.audio_stream.audio_mapping
        : [[0, 1]];

    await initDedicatedPorts();
    for (const pipeline of production_settings.pipelines) {
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
          `Connecting '${source.ingest_name}/${ingestUuid}}:${source.ingest_source_name}' to '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`
        );
        Log().debug(stream);
        const result = await connectIngestToPipeline(stream).catch((error) => {
          Log().error(
            `Source '${source.ingest_name}/${ingestUuid}:${source.ingest_source_name}' failed to connect to '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`,
            error
          );
          throw `Source '${source.ingest_name}/${ingestUuid}:${source.ingest_source_name}' failed to connect to '${pipeline.pipeline_name}/${pipeline.pipeline_id}: ${error.message}'`;
        });
        usedPorts.add(availablePort);
        Log().info(
          `Stream '${result.stream_uuid}' from '${source.ingest_name}/${ingestUuid}' to '${pipeline.pipeline_name}/${pipeline.pipeline_id}' connected`
        );
        sourceToPipelineStreams.push({
          source_id: source._id.toString(),
          stream_uuid: result.stream_uuid,
          input_slot: input_slot
        });
      } catch (error) {
        Log().debug(stream);
        Log().error(error);
        throw error;
      }
    }
  } catch (e) {
    Log().error('Could not add stream');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_stream',
              success: false
            }
          ]
        },
        error: 'Could not add stream: unexpected error occured'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_stream',
            success: false,
            message: e
          }
        ]
      },
      error: e
    };
  }

  try {
    if (!production.production_settings.pipelines[0].pipeline_id) {
      Log().error(
        `Missing pipeline_id for: ${production.production_settings.pipelines[0].pipeline_name}`
      );
      throw `Missing pipeline_id for: ${production.production_settings.pipelines[0].pipeline_name}`;
    }
    const multiviewsResponse = await getMultiviewsForPipeline(
      production.production_settings.pipelines[0].pipeline_id
    );

    const multiviews = multiviewsResponse.filter((multiview) => {
      const pipeline = production.production_settings.pipelines[0];
      const multiviewArray = pipeline.multiview;
      console.log('test multiview', multiview);
      console.log('test multiviewArray', multiviewArray);

      if (Array.isArray(multiviewArray)) {
        return multiviewArray.some(
          (item) => item.multiview_id === multiview.id
        );
      } else if (multiviewArray) {
        return (
          (multiviewArray as MultiviewSettings).multiview_id === multiview.id
        );
      }

      return false;
    });

    if (multiviews.length === 0) {
      Log().error(
        `No multiview found for pipeline: ${production.production_settings.pipelines[0].pipeline_id}`
      );
      throw `No multiview found for pipeline: ${production.production_settings.pipelines[0].pipeline_id}`;
    }
    multiviews.map(async (multiview) => {
      const views = multiview.layout.views;
      const viewsForSource = views.filter(
        (view) => view.input_slot === input_slot
      );
      if (!viewsForSource || viewsForSource.length === 0) {
        Log().info(
          `No view found for input slot: ${input_slot}. Will not connect source to  view`
        );
        return {
          ok: true,
          value: {
            success: true,
            steps: [
              {
                step: 'add_stream',
                success: true
              },
              {
                step: 'update_multiview',
                success: true
              }
            ],
            streams: sourceToPipelineStreams
          }
        };
        // TODO Check if this can be cleaned out. This is an old code and dont know the purpose of it, therefor I dont want to remove it yet.
        // return sourceToPipelineStreams;
      }
      const updatedViewsForSource = viewsForSource.map((v) => {
        return { ...v, label: source.name };
      });

      const updatedViews = [
        ...views.filter((view) => view.input_slot !== input_slot),
        ...updatedViewsForSource
      ];

      await updateMultiviewForPipeline(
        production.production_settings.pipelines[0].pipeline_id!,
        multiview.id,
        updatedViews
      );
    });
  } catch (e) {
    Log().error('Could not update multiview after adding stream');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_stream',
              success: true
            },
            {
              step: 'update_multiview',
              success: false
            }
          ]
        },
        error: 'Could not update multiview: unexpected error occured'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_stream',
            success: true
          },
          {
            step: 'update_multiview',
            success: false,
            message: e
          }
        ]
      },
      error: e
    };
  }
  return {
    ok: true,
    value: {
      success: true,
      steps: [
        {
          step: 'add_stream',
          success: true
        },
        {
          step: 'update_multiview',
          success: true
        }
      ],
      streams: sourceToPipelineStreams
    }
  };
}

export async function deleteStream(streamUuid: string) {
  const response = await fetch(
    new URL(
      AGILE_BASE_API_PATH + `/streams/${streamUuid}`,
      process.env.AGILE_URL
    ),
    {
      method: 'DELETE',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return;
  }
  throw await response.json();
}
