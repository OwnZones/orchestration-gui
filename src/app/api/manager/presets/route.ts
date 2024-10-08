import { NextRequest, NextResponse } from 'next/server';
import {
  getPresets,
  putMultiviewPreset
} from '../../../../api/manager/presets';
import { isAuthenticated } from '../../../../api/manager/auth';
import { Log } from '../../../../api/logger';
import { MultiviewPreset } from '../../../../interfaces/preset';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    return NextResponse.json(await getPresets());
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    const body = (await request.json()) as MultiviewPreset;
    const newMultiviewPreset = await putMultiviewPreset(body);
    return await new NextResponse(JSON.stringify(newMultiviewPreset), {
      status: 200
    });
  } catch (error) {
    Log().warn('Could not update preset', error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
