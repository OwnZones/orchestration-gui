import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../api/manager/auth';
import { getControlPanels } from '../../../../api/ateliereLive/controlpanels';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    const controlPanels = await getControlPanels();

    return new NextResponse(
      JSON.stringify({
        controlPanels: controlPanels
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
