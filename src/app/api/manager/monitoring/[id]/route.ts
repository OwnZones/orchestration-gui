import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { getMonitoring } from '../../../../../api/manager/monitoring';

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
    const monitoring = await getMonitoring(id);
    return new NextResponse(JSON.stringify(monitoring), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
