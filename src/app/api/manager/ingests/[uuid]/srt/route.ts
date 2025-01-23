import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { Log } from '../../../../../../api/logger';
import { createSrtSource } from '../../../../../../api/ateliereLive/ingest';

type Params = Promise<{
  uuid: string;
}>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { uuid } = await params;

  const data = await request.json();

  return await createSrtSource(uuid, data.srtPayload)
    .then((response) => {
      return new NextResponse(JSON.stringify(response));
    })
    .catch((error) => {
      Log().error(error);
      const errorResponse = {
        ok: false,
        error: error.message
      };
      return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
    });
}
