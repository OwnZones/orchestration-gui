import { NextRequest, NextResponse } from 'next/server';
import { getPipeline } from '../../../../../api/ateliereLive/pipelines/pipelines';
import { isActive } from '../../../../../api/ateliereLive/utils/pipeline';
import {
  getSRTMultiviews,
  getSRTOutputs,
  getWhepMultiviews
} from '../../../../../utils/pipeline';
import { isAuthenticated } from '../../../../../api/manager/auth';

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  const pipeline = await getPipeline(params.id);
  if (!pipeline) {
    console.log('Pipeline not found');
  }
  try {
    return new NextResponse(
      JSON.stringify({
        pipeline,
        status: {
          active: isActive(pipeline),
          multiviews: getSRTMultiviews(pipeline),
          outputs: getSRTOutputs(pipeline),
          whepMultiviews: getWhepMultiviews(pipeline)
        }
      }),
      {
        status: 200
      }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
