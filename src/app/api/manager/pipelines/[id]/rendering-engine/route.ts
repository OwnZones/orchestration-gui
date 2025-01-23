import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { getPipelineRenderingEngine } from '../../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';
import { Log } from '../../../../../../api/logger';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { id } = await params;

  try {
    const renderingEngine = await getPipelineRenderingEngine(id);
    return new NextResponse(
      JSON.stringify({
        renderingEngine
      }),
      {
        status: 200
      }
    );
  } catch (error) {
    Log().error(error);
    return new NextResponse(
      `Error getting rendering engine for pipeline! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
