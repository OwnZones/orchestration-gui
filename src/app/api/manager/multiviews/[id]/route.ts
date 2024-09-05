import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { getMultiviewPreset } from '../../../../../api/manager/presets';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { updateMultiviewForPipeline } from '../../../../../api/ateliereLive/pipelines/multiviews/multiviews';
import { MultiviewViews } from '../../../../../interfaces/multiview';

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    return NextResponse.json(await getMultiviewPreset(params.id));
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}
type PutMultiviewRequest = {
  pipelineId: string;
  multiviews: MultiviewViews[];
};
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    const data = (await request.json()) as PutMultiviewRequest;
    return NextResponse.json(
      await updateMultiviewForPipeline(
        data.pipelineId,
        params.id,
        data.multiviews
      )
    );
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}
