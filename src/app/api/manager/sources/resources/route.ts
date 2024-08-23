import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { getIngests } from '../../../../../api/agileLive/ingest';

export async function GET(): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    return NextResponse.json(await getIngests());
  } catch (e) {
    return new NextResponse(e?.toString(), { status: 404 });
  }
}
