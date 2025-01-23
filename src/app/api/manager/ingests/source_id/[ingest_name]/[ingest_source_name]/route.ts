import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../api/manager/auth';
import {
  getSourceIdFromSourceName,
  getUuidFromIngestName
} from '../../../../../../../api/ateliereLive/ingest';

type Params = Promise<{
  ingest_name: string;
  ingest_source_name: string;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { ingest_name, ingest_source_name } = await params;

  try {
    const ingestUuid = await getUuidFromIngestName(ingest_name, false);
    const sourceId = ingestUuid
      ? await getSourceIdFromSourceName(ingestUuid, ingest_source_name, false)
      : 0;
    return new NextResponse(JSON.stringify(sourceId), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error getting streams for ingest: ${error}`, {
      status: 500
    });
  }
}
