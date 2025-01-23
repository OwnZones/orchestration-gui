import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../../../api/manager/auth';
import { deleteHtmlFromPipeline } from '../../../../../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';
import { DeleteRenderingEngineSourceStep } from '../../../../../../../../../interfaces/Source';
import { Result } from '../../../../../../../../../interfaces/result';
import { Log } from '../../../../../../../../../api/logger';

type Params = Promise<{
  id: string;
  input_slot: number;
  ld_pipeline_id: string;
}>;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { id, input_slot } = await params;

  try {
    await deleteHtmlFromPipeline(id, input_slot).catch((e) => {
      Log().error(`Failed to delete html: ${id}: ${e.message}`);
      throw `Failed to delete html: ${id}: ${e.message}`;
    });
    return new NextResponse(
      JSON.stringify({
        ok: true,
        value: [
          {
            step: 'delete_html',
            success: true
          }
        ]
      })
    );
  } catch (e) {
    if (typeof e !== 'string') {
      return new NextResponse(
        JSON.stringify({
          ok: false,
          value: [
            {
              step: 'delete_html',
              success: false,
              message: `Failed to delete html`
            }
          ],
          error: 'Delete html failed'
        } satisfies Result<DeleteRenderingEngineSourceStep[]>)
      );
    }
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_html',
            success: false,
            message: `Failed to delete html: ${id}: ${e}`
          }
        ],
        error: e
      } satisfies Result<DeleteRenderingEngineSourceStep[]>)
    );
  }
}
