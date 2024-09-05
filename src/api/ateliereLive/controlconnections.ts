import { ResourcesCreateControlConnectionResponse } from '../../../types/ateliere-live';
import { LIVE_BASE_API_PATH } from '../../constants';
import { getAuthorizationHeader } from './utils/authheader';

export async function connectSenderAndReceiver(
  controlSenderId: string,
  controlReceiverId: string,
  delay: number,
  port: number
): Promise<ResourcesCreateControlConnectionResponse> {
  const response = await fetch(
    new URL(LIVE_BASE_API_PATH + `/controlconnections`, process.env.LIVE_URL),
    {
      method: 'POST',
      headers: {
        authorization: getAuthorizationHeader()
      },
      body: JSON.stringify({
        sender_side_uuid: controlSenderId,
        receiver_side_uuid: controlReceiverId,
        receiver_side_message_delay_ms: delay,
        receiver_side_port: port
      }),
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.text();
}

export async function disconnectReceiver(receiverId: string): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/controlconnections/${receiverId}`,
      process.env.LIVE_URL
    ),
    {
      method: 'DELETE',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return;
  }
  throw await response.text();
}
