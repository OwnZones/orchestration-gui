import { NextRequest, NextResponse } from 'next/server';
import { getMultiviewPreset } from '../../../../../api/manager/multiview-presets';
import { isAuthenticated } from '../../../../../api/manager/auth';

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
