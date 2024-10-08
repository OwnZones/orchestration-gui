import {
  ResourcesPipelineMultiviewResponse,
  ResourcesView
} from '../../../../../types/ateliere-live';
import { SourceReference } from '../../../../interfaces/Source';
import { getAuthorizationHeader } from '../../utils/authheader';
import { createMultiview } from '../../utils/multiview';
import { getSourcesByIds } from '../../../manager/sources';
import { Log } from '../../../logger';
import { ProductionSettings } from '../../../../interfaces/production';
import { MultiviewSettings } from '../../../../interfaces/multiview';
import { LIVE_BASE_API_PATH } from '../../../../constants';

export async function getMultiviewsForPipeline(
  pipelineUUID: string
): Promise<ResourcesPipelineMultiviewResponse[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUUID}/multiviews?expand=true`,
      process.env.LIVE_URL
    ),
    {
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
  throw await response.text();
}

export async function createMultiviewForPipeline(
  productionSettings: ProductionSettings,
  sourceRefs: SourceReference[]
): Promise<ResourcesPipelineMultiviewResponse[]> {
  const pipeline = productionSettings.pipelines.find((p) =>
    p.multiviews ? p.multiviews?.length > 0 : undefined
  );
  const multiviewIndexArray = pipeline?.multiviews
    ? pipeline.multiviews.map((p) => p.for_pipeline_idx)
    : undefined;

  const multiviewIndex = multiviewIndexArray?.find((p) => p !== undefined);

  if (multiviewIndex === undefined) {
    Log().error(`Did not find a specified pipeline in multiview settings`);
    throw `Did not find a specified pipeline in multiview settings`;
  }
  if (
    !productionSettings.pipelines[multiviewIndex].multiviews ||
    productionSettings.pipelines[multiviewIndex].multiviews?.length === 0
  ) {
    Log().error(
      `Did not find any multiview settings in pipeline settings for: ${productionSettings.pipelines[multiviewIndex]}`
    );
    throw `Did not find any multiview settings in pipeline settings for: ${productionSettings.pipelines[multiviewIndex]}`;
  }
  const pipelineUUID =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    productionSettings.pipelines[multiviewIndex].pipeline_id!;
  const sources = await getSourcesByIds(
    sourceRefs.map((ref) => (ref._id ? ref._id.toString() : ''))
  );
  const sourceRefsWithLabels = sourceRefs.map((ref) => {
    const refId = ref._id ? ref._id.toString() : '';
    if (!ref.label) {
      const source = sources.find((source) => source._id.toString() === refId);
      ref.label = source?.name || '';
    }
    return ref;
  });
  Log().info(`Creating a multiview for pipeline '${pipelineUUID}' from preset`);

  const multiviewsSettings: MultiviewSettings[] =
    productionSettings.pipelines[multiviewIndex].multiviews ?? [];

  const createEachMultiviewer = multiviewsSettings.map(
    async (singleMultiviewSettings) => {
      const multiview = createMultiview(
        sourceRefsWithLabels,
        singleMultiviewSettings
      );

      let payload = {};

      if (multiview.output.srt_mode === 'listener') {
        payload = {
          ...multiview,
          output: {
            format: multiview.output.format,
            frame_rate_d: multiview.output.frame_rate_d,
            frame_rate_n: multiview.output.frame_rate_n,
            local_ip: multiview.output.local_ip,
            local_port: multiview.output.local_port,
            srt_mode: multiview.output.srt_mode,
            srt_latency_ms: multiview.output.srt_latency_ms,
            srt_passphrase: multiview.output.srt_passphrase,
            video_format: multiview.output.video_format,
            video_kilobit_rate: multiview.output.video_kilobit_rate
          }
        };
      }
      if (multiview.output.srt_mode === 'caller') {
        payload = {
          ...multiview,
          output: {
            format: multiview.output.format,
            frame_rate_d: multiview.output.frame_rate_d,
            frame_rate_n: multiview.output.frame_rate_n,
            local_ip: '0.0.0.0',
            local_port: 0,
            remote_ip: multiview.output.remote_ip,
            remote_port: multiview.output.remote_port,
            srt_mode: multiview.output.srt_mode,
            srt_latency_ms: multiview.output.srt_latency_ms,
            srt_passphrase: multiview.output.srt_passphrase,
            video_format: multiview.output.video_format,
            video_kilobit_rate: multiview.output.video_kilobit_rate
          }
        };
      }
      const response = await fetch(
        new URL(
          LIVE_BASE_API_PATH + `/pipelines/${pipelineUUID}/multiviews`,
          process.env.LIVE_URL
        ),
        {
          method: 'POST',
          headers: {
            authorization: getAuthorizationHeader()
          },
          next: {
            revalidate: 0
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        return await response.json();
      }
      throw await response.text();
    }
  );

  return Promise.all(createEachMultiviewer);
}

export async function deleteMultiviewFromPipeline(
  pipelineUUID: string,
  multiviewId: number
): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipelineUUID}/multiviews/${multiviewId}`,
      process.env.LIVE_URL
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
  throw await response.text();
}

export async function deleteAllMultiviewsFromPipeline(
  pipelineUUID: string
): Promise<void> {
  const multiviews = await getMultiviewsForPipeline(pipelineUUID);

  await Promise.allSettled(
    multiviews.map((multiview) =>
      deleteMultiviewFromPipeline(pipelineUUID, multiview.id!)
    )
  );
}

export async function updateMultiviewForPipeline(
  pipelineUUID: string,
  multiviewId: number,
  views: ResourcesView[]
): Promise<ResourcesPipelineMultiviewResponse> {
  Log().info(
    `Updating multiview ${multiviewId} for pipeline '${pipelineUUID}'`
  );
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipelineUUID}/multiviews/${multiviewId}`,
      process.env.LIVE_URL
    ),
    {
      method: 'PUT',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      },
      body: JSON.stringify({ views: views })
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.text();
}
