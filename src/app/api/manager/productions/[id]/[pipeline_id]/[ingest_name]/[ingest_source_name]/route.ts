import { NextRequest, NextResponse } from 'next/server';
import {
  getProductionPipelineSourceAlignment,
  setProductionPipelineSourceAlignment,
  getProductionSourceLatency,
  setProductionPipelineSourceLatency
} from '../../../../../../../../api/manager/productions';
import { isAuthenticated } from '../../../../../../../../api/manager/auth';
import {
  getSourceIdFromSourceName,
  getUuidFromIngestName
} from '../../../../../../../../api/ateliereLive/ingest';

type Params = Promise<{
  id: string;
  pipeline_id: string;
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

  const { id, pipeline_id, ingest_name, ingest_source_name } = await params;

  try {
    const ingestUuid = await getUuidFromIngestName(ingest_name);

    const sourceId = ingestUuid
      ? await getSourceIdFromSourceName(ingestUuid, ingest_source_name)
      : null;

    const alignment =
      sourceId !== null && sourceId !== undefined
        ? await getProductionPipelineSourceAlignment(
            id,
            pipeline_id,
            ingest_source_name,
            ingest_name
          )
        : 0;

    const latency =
      sourceId !== null && sourceId !== undefined
        ? await getProductionSourceLatency(
            id,
            pipeline_id,
            ingest_source_name,
            ingest_name
          )
        : 0;

    const result = {
      alignment: alignment,
      latency: latency
    };

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.log('Error:', error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const body = await request.json();

  const alignment = body.alignment_ms;
  const latency = body.max_network_latency_ms;
  const { id, pipeline_id, ingest_name, ingest_source_name } = await params;

  try {
    const ingestUuid = await getUuidFromIngestName(ingest_name);
    const sourceId = ingestUuid
      ? await getSourceIdFromSourceName(ingestUuid, ingest_source_name)
      : null;

    if (sourceId !== null && sourceId !== undefined) {
      const alignmentResult = await setProductionPipelineSourceAlignment(
        id,
        pipeline_id,
        ingest_name,
        ingest_source_name,
        alignment
      );
      const latencyResult = await setProductionPipelineSourceLatency(
        id,
        pipeline_id,
        ingest_name,
        ingest_source_name,
        latency
      );

      return new NextResponse(
        JSON.stringify({ alignment: alignmentResult, latency: latencyResult }),
        { status: 200 }
      );
    }
  } catch (error) {
    return new NextResponse(`Error updating DB! Error: ${error}`, {
      status: 500
    });
  }
}
