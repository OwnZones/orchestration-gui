import { ResourcesControlPanelResponse } from '../../../types/ateliere-live';
import { LIVE_BASE_API_PATH } from '../../constants';
import { getAuthorizationHeader } from './utils/authheader';

export async function getControlPanels(): Promise<
  ResourcesControlPanelResponse[]
> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/controlpanels?expand=true`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return (await response.json()).map(
      (cpanel: ResourcesControlPanelResponse) => {
        return cpanel;
      }
    );
  }
  throw await response.json();
}
