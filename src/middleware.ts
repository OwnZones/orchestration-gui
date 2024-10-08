import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
export { withAuth } from 'next-auth/middleware';

const auth = {
  login: 'dev',
  password: 'manual-dev-auth'
};

function basicAuthMiddleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  if (process.env.NEXTAUTH_SECRET !== undefined) {
    return;
  }

  const b64auth =
    (request.headers.get('authorization') || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64')
    .toString()
    .split(':');

  if (login !== auth.login || password !== auth.password) {
    return new NextResponse('😢', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="401"' }
    });
  }
}

export default withAuth(function middleware(req) {
  if (req.nextUrl.pathname.endsWith('/api/health')) {
    return;
  }

  const basicAuthResponse = basicAuthMiddleware(req);
  if (basicAuthResponse) {
    return basicAuthResponse;
  }
});

export const config = { matcher: ['/', '/((?!api|images|html_input).*)/'] };
