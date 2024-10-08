import WebSocket from 'ws';

function createWebSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${process.env.CONTROL_PANEL_WS}`);
    ws.on('error', reject);
    ws.on('open', () => {
      resolve(ws);
    });
  });
}

export async function createControlPanelWebSocket() {
  const ws = await createWebSocket();
  return {
    createHtml: (input: number) => {
      ws.send(`html create ${input} 1920 1080`);
    },
    createMediaplayer: (input: number) => {
      ws.send(`media create ${input} ${process.env.MEDIAPLAYER_PLACEHOLDER}`);
    },
    closeHtml: (input: number) => {
      ws.send(`html close ${input}`);
    },
    closeMediaplayer: (input: number) => {
      ws.send(`media close ${input}`);
    },
    close: () =>
      setTimeout(() => {
        ws.close();
      }, 1000)
  };
}
