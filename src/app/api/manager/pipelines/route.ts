import { NextRequest, NextResponse } from 'next/server';
import { getPipelines } from '../../../../api/ateliereLive/pipelines/pipelines';
import { isAuthenticated } from '../../../../api/manager/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    const pipelines = await getPipelines();

    return new NextResponse(
      JSON.stringify({
        pipelines: pipelines
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
