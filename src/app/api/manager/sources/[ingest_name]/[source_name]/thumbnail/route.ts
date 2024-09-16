import { NextRequest, NextResponse } from 'next/server';
import {
  getSourceIdFromSourceName,
  getSourceThumbnail,
  getUuidFromIngestName
} from '../../../../../../../api/ateliereLive/ingest';
import { isAuthenticated } from '../../../../../../../api/manager/auth';

type Params = {
  ingest_name: string;
  source_name: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    const ingestUuid = await getUuidFromIngestName(params.ingest_name);
    const sourceId = await getSourceIdFromSourceName(
      ingestUuid,
      params.source_name
    );
    const base64Image = await getSourceThumbnail(ingestUuid, sourceId);
    if (!base64Image) {
      return new NextResponse('image not found', { status: 404 });
    }
    return new NextResponse(Buffer.from(base64Image, 'base64'));
  } catch (e) {
    return new NextResponse(e?.toString(), { status: 404 });
  }
}
