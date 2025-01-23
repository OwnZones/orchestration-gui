import { NextRequest, NextResponse } from 'next/server';
import { getPresetByid } from '../../../../../api/manager/presets';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { putPreset } from '../../../../../api/manager/presets';
import { PresetWithId } from '../../../../../interfaces/preset';
import { Log } from '../../../../../api/logger';

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
    return NextResponse.json(await getPresetByid(id));
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}

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
    const body = (await request.json()) as PresetWithId;
    const prod = await putPreset(id, body);
    return new NextResponse(JSON.stringify(prod), { status: 200 });
  } catch (error) {
    Log().warn('Could not update preset', error);

    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
