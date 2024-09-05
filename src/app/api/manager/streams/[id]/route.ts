import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { deleteStream } from '../../../../../api/agileLive/pipelines/streams/streams';
import { MultiviewSettings } from '../../../../../interfaces/multiview';
import { updateMultiviewForPipeline } from '../../../../../api/agileLive/pipelines/multiviews/multiviews';
import { DeleteSourceStep } from '../../../../../interfaces/Source';
import { Result } from '../../../../../interfaces/result';
import { Log } from '../../../../../api/logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  const body = await request.json();
  const multiview = body.multiview as MultiviewSettings[];
  try {
    await deleteStream(params.id).catch((e) => {
      Log().error(`Failed to delete stream: ${params.id}: ${e.message}`);
      throw `Failed to delete stream: ${params.id}: ${e.message}`;
    });
    if (!multiview || multiview.length === 0) {
      return new NextResponse(
        JSON.stringify({
          ok: true,
          value: [
            {
              step: 'delete_stream',
              success: true
            }
          ]
        })
      );
    }
  } catch (e) {
    if (typeof e !== 'string') {
      return new NextResponse(
        JSON.stringify({
          ok: false,
          value: [
            {
              step: 'delete_stream',
              success: false,
              message: `Failed to delete stream: unexpected error`
            }
          ],
          error: 'unexpected'
        } satisfies Result<DeleteSourceStep[]>)
      );
    }
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_stream',
            success: false,
            message: `Failed to delete stream: ${params.id}: ${e}`
          }
        ],
        error: 'Failed to remove stream properly'
      } satisfies Result<DeleteSourceStep[]>)
    );
  }
  try {
    const multiviewUpdates = multiview.map(async (singleMultiview) => {
      if (!singleMultiview.multiview_id) {
        throw `The provided multiview settings did not contain any multiview id`;
      }
      return updateMultiviewForPipeline(
        body.pipelineUUID,
        singleMultiview.multiview_id,
        singleMultiview.layout.views
      ).catch((e) => {
        throw `Error when updating multiview: ${e.message}`;
      });
    });

    await Promise.all(multiviewUpdates);

    return new NextResponse(
      JSON.stringify({
        ok: true,
        value: [
          {
            step: 'delete_stream',
            success: true
          },
          {
            step: 'update_multiview',
            success: true
          }
        ]
      } satisfies Result<DeleteSourceStep[]>)
    );
  } catch (e) {
    if (typeof e !== 'string') {
      return new NextResponse(
        JSON.stringify({
          ok: false,
          value: [
            {
              step: 'delete_stream',
              success: true
            },
            {
              step: 'update_multiview',
              success: false,
              message: 'Failed to update multiview: unexpected error'
            }
          ],
          error: 'unexpected'
        } satisfies Result<DeleteSourceStep[]>)
      );
    }
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_stream',
            success: true
          },
          { step: 'update_multiview', success: false, message: e }
        ],
        error: e
      } satisfies Result<DeleteSourceStep[]>)
    );
  }
}
