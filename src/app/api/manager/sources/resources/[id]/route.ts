import { NextResponse, NextRequest } from "next/server";
import { getIngestSources } from "../../../../../../api/agileLive/ingest";
import { isAuthenticated } from "../../../../../../api/manager/auth";

type Params = {
  id: string;
};

export async function GET(request: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
      return new NextResponse(`Not Authorized!`, {
          status: 403
          });
    }
  
  try {
    return NextResponse.json(await getIngestSources(params.id));
  } catch (e) {
    return new NextResponse(e?.toString(), { status: 404 });
  }
}
