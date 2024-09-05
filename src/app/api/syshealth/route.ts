import { NextResponse } from 'next/server';
import { getIngests } from '../../../api/ateliereLive/ingest';
import { connected } from '../../../api/mongoClient/dbClient';
import { isAuthenticated } from '../../../api/manager/auth';
import { LIVE_BASE_API_PATH } from '../../../constants';

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

  if (isConnectedToLive && isConnectedToDatabase) {
    return new NextResponse(
      JSON.stringify({
        message: 'Connected!',
        database: {
          connected: isConnectedToDatabase
        },
        liveApi: { connected: isConnectedToLive }
      }),
      {
        status: 200
      }
    );
  }

  const databaseUrl = new URL('', process.env.MONGODB_URI);

  return new NextResponse(
    JSON.stringify({
      message: 'Something went wrong with the connection!',
      liveApi: {
        connected: isConnectedToLive,
        url: new URL(LIVE_BASE_API_PATH, process.env.LIVE_URL)
      },
      database: {
        connected: isConnectedToDatabase,
        url: databaseUrl.host + databaseUrl.pathname
      }
    }),
    {
      status: 500
    }
  );
}
