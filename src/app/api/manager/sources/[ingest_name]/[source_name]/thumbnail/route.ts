import { NextRequest, NextResponse } from 'next/server';
import {
  getSourceIdFromSourceName,
  getSourceThumbnail,
  getUuidFromIngestName
} from '../../../../../../../api/ateliereLive/ingest';
import { isAuthenticated } from '../../../../../../../api/manager/auth';

type Params = Promise<{ ingest_name: string; source_name: string }>;

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
  const { source_name } = await params;
  try {
    const ingestUuid = await getUuidFromIngestName(ingest_name);
    const sourceId = await getSourceIdFromSourceName(ingestUuid, source_name);
    const base64Image = await getSourceThumbnail(ingestUuid, sourceId);
    if (!base64Image) {
      return new NextResponse('image not found', { status: 404 });
    }
    return new NextResponse(Buffer.from(base64Image, 'base64'));
  } catch (e) {
    return new NextResponse(e?.toString(), { status: 404 });
  }
}
