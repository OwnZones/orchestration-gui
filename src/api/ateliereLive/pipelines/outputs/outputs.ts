import { ResourcesOutputStatusResponse } from '../../../../../types/ateliere-live';
import { LIVE_BASE_API_PATH } from '../../../../constants';
import { PipelineOutputSettings } from '../../../../interfaces/pipeline';
import { getAuthorizationHeader } from '../../utils/authheader';

export async function getPipelineOutputs(
  pipelineId: string
): Promise<ResourcesOutputStatusResponse[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineId}/outputs?expand=true`,
      process.env.LIVE_URL
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
    return response.json();
  }
  throw await response.json();
}

export async function stopAllOutputStreamsByUuid(
  pipeId: string,
  outputId: string
) {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipeId}/outputs/${outputId}/streams`,
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

export async function stopSingleOutputStream(
  pipeId: string,
  outputId: string,
  outputStreamId: string
) {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipeId}/outputs/${outputId}/streams/${outputStreamId}`,
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

export async function startPipelineStream(
  pipelineId: string,
  outputId: string,
  streamSettings: PipelineOutputSettings[]
) {
  const requests = streamSettings.map((streamSetting) => {
    return fetch(
      new URL(
        LIVE_BASE_API_PATH +
          `/pipelines/${pipelineId}/outputs/${outputId}/streams`,
        process.env.LIVE_URL
      ),
      {
        method: 'POST',
        headers: {
          authorization: getAuthorizationHeader()
        },
        body: JSON.stringify(streamSetting),
        next: {
          revalidate: 0
        }
      }
    );
  });
  const responses = await Promise.all(requests);

  if (responses.find((res) => !res.ok)) {
    throw await responses.find((res) => !res.ok)?.json();
  }
  return await responses.map((res) => res.json());
}
