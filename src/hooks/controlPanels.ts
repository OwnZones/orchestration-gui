import { useCallback, useEffect, useState } from 'react';
import { DataHook } from './types';
import { ResourcesControlPanelResponse } from '../../types/ateliere-live';
const ONE_MINUTE = 1000 * 60;
export function useControlPanels(): [
  ...DataHook<ResourcesControlPanelResponse[]>,
  () => void
] {
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);
  const [controlPanels, setControlPanels] = useState<
    ResourcesControlPanelResponse[]
  >([]);
  const refresh = useCallback(() => setTrigger((trigger) => trigger + 1), []);
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    setLoading(true);
    fetch('/api/manager/controlpanels', {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    })
      .then(async (response) => {
        if (response.ok) {
          setControlPanels((await response.json()).controlPanels);
        }
      })
      .finally(() => {
        setLoading(false);
        timeout = setTimeout(() => setTrigger(trigger + 1), ONE_MINUTE / 6);
      });
    return () => clearTimeout(timeout);
  }, [trigger]);

  return [
    controlPanels.sort((a, b) => a.name.localeCompare(b.name)),
    loading,
    undefined,
    refresh
  ];
}
