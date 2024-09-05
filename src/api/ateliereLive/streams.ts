import { LIVE_BASE_API_PATH } from '../../constants';
import { PipelineStreamSettings } from '../../interfaces/pipeline';
import { getAuthorizationHeader } from './utils/authheader';

export async function connectIngestToPipeline(
  stream: PipelineStreamSettings
): Promise<{ stream_uuid: string }> {
  if (!stream.pipeline_id) {
    throw new Error('Error: No pipeline_id!');
  }
  const response = await fetch(
    new URL(LIVE_BASE_API_PATH + `/streams`, process.env.LIVE_URL),
    {
      method: 'POST',
      headers: {
        authorization: getAuthorizationHeader()
      },
      body: JSON.stringify(stream),
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

export async function deleteStreamByUuid(streamUuId: string) {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/streams/${streamUuId}`,
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
    return response.status;
  }
  throw await response.text();
}
