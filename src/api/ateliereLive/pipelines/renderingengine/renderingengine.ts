import {
  ResourcesHTMLBrowser,
  ResourcesMediaPlayer,
  ResourcesRenderingEngineFormat,
  ResourcesRenderingEngineResponse
} from '../../../../../types/ateliere-live';
import { LIVE_BASE_API_PATH } from '../../../../constants';
import { MultiviewSettings } from '../../../../interfaces/multiview';
import { Production } from '../../../../interfaces/production';
import {
  HTMLSource,
  MediaSource
} from '../../../../interfaces/renderingEngine';
import { SourceReference } from '../../../../interfaces/Source';
import { Log } from '../../../logger';
import { getAuthorizationHeader } from '../../utils/authheader';
import {
  getMultiviewsForPipeline,
  updateMultiviewForPipeline
} from '../multiviews/multiviews';

export async function getPipelineHtmlSources(
  pipelineUuid: string
): Promise<ResourcesHTMLBrowser[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/html`,
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
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
  throw await response.json();
}

export async function createPipelineHtmlSource(
  production: Production,
  inputSlot: number,
  data: HTMLSource,
  source: SourceReference
) {
  const payload = {
    height: Number(data.height),
    input_slot: Number(inputSlot),
    url: data.url || '',
    width: Number(data.width)
  };

  try {
    const { production_settings } = production;

    for (let i = 0; i < production_settings.pipelines.length; i++) {
      const response = await fetch(
        new URL(
          LIVE_BASE_API_PATH +
            `/pipelines/${production_settings.pipelines[i].pipeline_id}/renderingengine/html`,
          process.env.LIVE_URL
        ),
        {
          method: 'POST',
          headers: {
            authorization: getAuthorizationHeader()
          },
          body: JSON.stringify(payload)
        }
      );
      const text = await response.text();

      if (response.status === 201) {
        if (text.trim().length > 0) {
          Log().warn('Unexpected content for 201 response:', text);
        }
      } else if (
        response.status === 400 ||
        response.status === 404 ||
        response.status === 500
      ) {
        try {
          const errorResponse = JSON.parse(text);
          Log().error('API error response:', errorResponse);
          throw new Error(
            `API error ${response.status}: ${errorResponse.message}`
          );
        } catch (parseError) {
          Log().error('Failed to parse error response as JSON:', text);
          throw new Error(`API error ${response.status}: ${text}`);
        }
      } else {
        Log().error(`Unexpected status code ${response.status} received`);
        Log().error('Response body:', text);
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    }
  } catch (e) {
    Log().error('Could not add html');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_html',
              success: false
            }
          ]
        },
        error: 'Could not add html'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_html',
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
      const multiviewArray = pipeline.multiviews;

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

    if (multiviews.length === 0 || !multiviews) {
      Log().error(
        `No multiview found for pipeline: ${production.production_settings.pipelines[0].pipeline_id}`
      );
      throw `No multiview found for pipeline: ${production.production_settings.pipelines[0].pipeline_id}`;
    }

    await Promise.all(
      multiviews.map(async (multiview) => {
        const views = multiview.layout.views;
        const viewsForSource = views.filter(
          (view) => view.input_slot === inputSlot
        );
        if (!viewsForSource || viewsForSource.length === 0) {
          Log().info(
            `No view found for input slot: ${inputSlot}. Will not connect source to view`
          );
          return {
            ok: true,
            value: {
              success: true,
              steps: [
                {
                  step: 'add_html',
                  success: true
                },
                {
                  step: 'update_multiview',
                  success: true
                }
              ]
            }
          };
        }
        const updatedViewsForSource = viewsForSource.map((v) => {
          return { ...v, label: source.label };
        });

        const updatedViews = [
          ...views.filter((view) => view.input_slot !== inputSlot),
          ...updatedViewsForSource
        ];

        await updateMultiviewForPipeline(
          production.production_settings.pipelines[0].pipeline_id!,
          multiview.id,
          updatedViews
        );
      })
    );
  } catch (e) {
    Log().error('Could not update multiview');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_html',
              success: true
            },
            {
              step: 'update_multiview',
              success: false
            }
          ]
        },
        error: 'Could not update multiview'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_html',
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
          step: 'add_html',
          success: true
        },
        {
          step: 'update_multiview',
          success: true
        }
      ]
    }
  };
}

export async function deleteHtmlFromPipeline(
  pipelineUuid: string,
  inputSlot: number
): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipelineUuid}/renderingengine/html/${inputSlot}`,
      process.env.LIVE_URL
    ),
    {
      method: 'DELETE',
      headers: {
        authorization: getAuthorizationHeader()
      }
    }
  );
  if (response.ok) {
    const text = await response.text();

    if (text) {
      return JSON.parse(text);
    }
    return;
  }
  throw await response.json();
}

export async function getPipelineMediaSources(
  pipelineUuid: string
): Promise<ResourcesMediaPlayer[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/media`,
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
    return await response.json();
  }
  throw await response.json();
}

export async function createPipelineMediaSource(
  production: Production,
  inputSlot: number,
  data: MediaSource,
  source: SourceReference
) {
  const payload = {
    path: data.filename,
    input_slot: Number(inputSlot)
  };

  try {
    const { production_settings } = production;

    for (let i = 0; i < production_settings.pipelines.length; i++) {
      const response = await fetch(
        new URL(
          LIVE_BASE_API_PATH +
            `/pipelines/${production_settings.pipelines[i].pipeline_id}/renderingengine/media`,
          process.env.LIVE_URL
        ),
        {
          method: 'POST',
          headers: {
            authorization: getAuthorizationHeader()
          },
          body: JSON.stringify(payload)
        }
      );
      const text = await response.text();

      if (response.status === 201) {
        if (text.trim().length > 0) {
          Log().warn('Unexpected content for 201 response:', text);
        }
      } else if (
        response.status === 400 ||
        response.status === 404 ||
        response.status === 500
      ) {
        try {
          const errorResponse = JSON.parse(text);
          Log().error('API error response:', errorResponse);
          throw new Error(
            `API error ${response.status}: ${errorResponse.message}`
          );
        } catch (parseError) {
          Log().error('Failed to parse error response as JSON:', text);
          throw new Error(`API error ${response.status}: ${text}`);
        }
      } else {
        Log().error(`Unexpected status code ${response.status} received`);
        Log().error('Response body:', text);
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    }
  } catch (e) {
    Log().error('Could not add media');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_media',
              success: false
            }
          ]
        },
        error: 'Could not add media'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_media',
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
      const multiviewArray = pipeline.multiviews;

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

    if (multiviews.length === 0 || !multiviews) {
      Log().error(
        `No multiview found for pipeline: ${production.production_settings.pipelines[0].pipeline_id}`
      );
      throw `No multiview found for pipeline: ${production.production_settings.pipelines[0].pipeline_id}`;
    }

    await Promise.all(
      multiviews.map(async (multiview) => {
        const views = multiview.layout.views;
        const viewsForSource = views.filter(
          (view) => view.input_slot === inputSlot
        );
        if (!viewsForSource || viewsForSource.length === 0) {
          Log().info(
            `No view found for input slot: ${inputSlot}. Will not connect source to view`
          );
          return {
            ok: true,
            value: {
              success: true,
              steps: [
                {
                  step: 'add_media',
                  success: true
                },
                {
                  step: 'update_multiview',
                  success: true
                }
              ]
            }
          };
        }
        const updatedViewsForSource = viewsForSource.map((v) => {
          return { ...v, label: source.label };
        });

        const updatedViews = [
          ...views.filter((view) => view.input_slot !== inputSlot),
          ...updatedViewsForSource
        ];

        await updateMultiviewForPipeline(
          production.production_settings.pipelines[0].pipeline_id!,
          multiview.id,
          updatedViews
        );
      })
    );
  } catch (e) {
    Log().error('Could not update multiview');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_media',
              success: true
            },
            {
              step: 'update_multiview',
              success: false
            }
          ]
        },
        error: 'Could not update multiview'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_media',
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
}

export async function deleteMediaFromPipeline(
  pipelineUuid: string,
  inputSlot: number
): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipelineUuid}/renderingengine/media/${inputSlot}`,
      process.env.LIVE_URL
    ),
    {
      method: 'DELETE',
      headers: {
        authorization: getAuthorizationHeader()
      }
    }
  );
  if (response.ok) {
    const text = await response.text();

    if (text) {
      return JSON.parse(text);
    }
    return;
  }
  throw await response.json();
}

export async function getPipelineRenderingEngine(
  pipelineUuid: string
): Promise<ResourcesRenderingEngineResponse> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine`,
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
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Parsing error in successful response.');
    }
  }

  const contentType = response.headers.get('content-type');
  const responseText = await response.text();

  if (contentType && contentType.includes('application/json')) {
    try {
      throw JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse JSON error response: ${responseText}`);
    }
  } else {
    throw new Error(`Unexpected non-JSON response: ${responseText}`);
  }
}

export async function getPipelineRenderingEngineHtml(
  pipelineUuid: string
): Promise<ResourcesHTMLBrowser[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/html`,
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
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Parsing error in successful response.');
    }
  }

  const contentType = response.headers.get('content-type');
  const responseText = await response.text();

  if (contentType && contentType.includes('application/json')) {
    try {
      throw JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse JSON error response: ${responseText}`);
    }
  } else {
    throw new Error(`Unexpected non-JSON response: ${responseText}`);
  }
}

export async function getPipelineRenderingEngineMedia(
  pipelineUuid: string
): Promise<ResourcesMediaPlayer[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/media`,
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
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Parsing error in successful response.');
    }
  }

  const contentType = response.headers.get('content-type');
  const responseText = await response.text();

  if (contentType && contentType.includes('application/json')) {
    try {
      throw JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse JSON error response: ${responseText}`);
    }
  } else {
    throw new Error(`Unexpected non-JSON response: ${responseText}`);
  }
}

export async function putPipelineRenderingEngineFormat(
  pipelineUuid: string,
  format: ResourcesRenderingEngineFormat
): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/format`,
      process.env.LIVE_URL
    ),
    {
      method: 'PUT',
      headers: {
        authorization: getAuthorizationHeader()
      },
      body: JSON.stringify(format)
    }
  );

  if (response.ok) {
    return;
  }

  if (response.status == 404) {
    Log().info(`Failed to set new format for pipeline: ${pipelineUuid}`);
    return;
  }

  const errorMessage = await response.text().then((text) => {
    try {
      return JSON.parse(text).message;
    } catch {
      return text; // Return raw text if JSON parsing fails
    }
  });

  throw new Error(errorMessage);
}
