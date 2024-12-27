import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { getMultiviewPreset } from '../../../../../api/manager/presets';
import { updateMultiviewForPipeline } from '../../../../../api/ateliereLive/pipelines/multiviews/multiviews';
import { MultiviewViews } from '../../../../../interfaces/multiview';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  const { id } = await params;
  try {
    return NextResponse.json(await getMultiviewPreset(id));
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
  const { id } = await params;
  try {
    const data = (await request.json()) as PutMultiviewRequest;
    return NextResponse.json(
      await updateMultiviewForPipeline(
        data.pipelineId,
        Number(id),
        data.multiviews
      )
    );
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}
