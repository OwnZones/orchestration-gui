import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import {
  getIngestSources,
  getUuidFromIngestName
} from '../../../../../../api/ateliereLive/ingest';

type Params = Promise<{
  ingest_name: string;
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

  const { ingest_name } = await params;

  try {
    const ingestUuid = await getUuidFromIngestName(ingest_name);
    const ingestSources = ingestUuid ? await getIngestSources(ingestUuid) : [];
    return new NextResponse(JSON.stringify(ingestSources), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error getting sources for ingest: ${error}`, {
      status: 500
    });
  }
}
