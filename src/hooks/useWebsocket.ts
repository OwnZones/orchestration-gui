import { API_SECRET_KEY } from '../utils/constants';

export function useWebsocket() {
  const closeWebsocket = async (
    action: 'closeMediaplayer' | 'closeHtml',
    inputSlot: number
  ) => {
    return fetch('/api/manager/websocket', {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({ action, inputSlot })
    }).then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      throw await response.text();
    });
  };
  return [closeWebsocket];
}
