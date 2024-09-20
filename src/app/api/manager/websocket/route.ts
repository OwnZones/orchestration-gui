import { NextResponse } from 'next/server';

const wsUrl = `ws://${process.env.CONTROL_PANEL_WS}`;

export async function POST(request: Request) {
  const { action, inputSlot } = await request.json();

  if (!wsUrl) {
    return NextResponse.json(
      { message: 'WebSocket URL is not defined' },
      { status: 500 }
    );
  }

  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (action === 'closeHtml') {
        ws.send(`html close ${inputSlot}`);
        ws.send('html reset');
      } else if (action === 'closeMediaplayer') {
        ws.send(`media close ${inputSlot}`);
        ws.send('media reset');
      }
      ws.close();
    };

    ws.onerror = (error) => {
      resolve(
        NextResponse.json(
          { message: 'WebSocket error', error },
          { status: 500 }
        )
      );
    };
  });
}
