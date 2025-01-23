import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProduction,
  getProduction,
  putProduction
} from '../../../../../api/manager/productions';
import { Production } from '../../../../../interfaces/production';
import { isAuthenticated } from '../../../../../api/manager/auth';

type Params = Promise<{
  id: string;
  data?: any;
}>;

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
    const production = await getProduction(id);
    const prod = {
      ...production,
      sources: production.sources.sort((a, b) => a.input_slot - b.input_slot),
      _id: production._id.toString()
    };
    return new NextResponse(JSON.stringify(prod), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
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
    const body = (await request.json()) as Production;
    const prod = await putProduction(id, body);
    return new NextResponse(JSON.stringify(prod), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}

export async function DELETE(
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
    await deleteProduction(id);
    return new NextResponse(null, {
      status: 200
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(
      `Error occurred while posting to DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
