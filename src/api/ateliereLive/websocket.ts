import WebSocket from 'ws';

function createWebSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${process.env.CONTROL_PANEL_WS}`);
    ws.on('error', reject);
    ws.on('open', () => {
      // const send = ws.send.bind(ws);
      // ws.send = (message) => {
      //   console.debug(`[websocket] sending message: ${message}`);
      //   send(message);
      // };
      resolve(ws);
    });
  });
}

export async function createControlPanelWebSocket() {
  const ws = await createWebSocket();
  return {
    createHtml: (input: number) => {
      ws.send('html reset');
      ws.send(`html create ${input} 1920 1080`);
      setTimeout(() => {
        ws.send(
          `html load ${input} ${process.env.NEXTAUTH_URL}/html_input?input=${input}`
        );
      }, 1000);
    },
    createMediaplayer: (input: number) => {
      ws.send('media reset');
      ws.send(`media create ${input} ${process.env.MEDIAPLAYER_PLACEHOLDER}`);
      ws.send(`media play ${input}`);
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
