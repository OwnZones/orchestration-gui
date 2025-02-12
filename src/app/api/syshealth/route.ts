import { NextResponse } from 'next/server';
import { getIngests } from '../../../api/ateliereLive/ingest';
import { connected } from '../../../api/mongoClient/dbClient';
import { isAuthenticated } from '../../../api/manager/auth';
import { LIVE_BASE_API_PATH } from '../../../constants';

let liveApiUrl: string;
if (!process.env.LIVE_URL) {
  liveApiUrl = 'LIVE_URL is not set in environment variables';
} else {
  liveApiUrl = new URL(LIVE_BASE_API_PATH, process.env.LIVE_URL).toString();
}

export async function GET(): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const isConnectedToLive = await getIngests()
    .then(() => true)
    .catch(() => false);

  const isConnectedToDatabase = await connected().catch(() => false);

  const databaseUrl = new URL('', process.env.MONGODB_URI);

  return new NextResponse(
    JSON.stringify({
      message: '',
      liveApi: {
        connected: isConnectedToLive,
        url: liveApiUrl
      },
      database: {
        connected: isConnectedToDatabase,
        url: databaseUrl.host + databaseUrl.pathname
      }
    }),
    {
      status: 200
    }
  );
}
