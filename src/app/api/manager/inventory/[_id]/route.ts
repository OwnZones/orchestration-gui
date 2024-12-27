import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { purgeInventorySourceItem } from '../../../../../api/manager/inventory';

type Params = Promise<{ _id: string }>;

export async function PUT(
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
    const response = await purgeInventorySourceItem(_id);
    if (response.acknowledged && response.modifiedCount === 0) {
      return new NextResponse(`Did not match requirements`, {
        status: 204
      });
    } else if (response.acknowledged) {
      return new NextResponse(null, {
        status: 200
      });
    } else {
      return new NextResponse(`Could not update database-status`, {
        status: 500
      });
    }
  } catch (error) {
    return new NextResponse(
      `Error occurred while posting to DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
