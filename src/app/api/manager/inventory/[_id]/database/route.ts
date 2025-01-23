import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { removeInventorySource } from '../../../../../../api/manager/inventory';

type Params = Promise<{ _id: string }>;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  const { _id } = await params;

  try {
    await removeInventorySource(_id);
    return new NextResponse(null, {
      status: 200
    });
  } catch (error) {
    return new NextResponse(
      `Error occurred while posting to DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
