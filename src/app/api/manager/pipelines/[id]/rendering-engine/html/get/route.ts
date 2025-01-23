import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../../api/manager/auth';
import { getPipelineHtmlSources } from '../../../../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';

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
    const htmlSources = await getPipelineHtmlSources(id);
    return new NextResponse(
      JSON.stringify({
        htmlSources
      }),
      {
        status: 200
      }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(
      `Error fetching pipeline html sources! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
