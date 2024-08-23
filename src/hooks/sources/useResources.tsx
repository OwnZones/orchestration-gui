import {
  ResourcesSourceResponse,
  ResourcesCompactIngestResponse
} from '../../../types/agile-live';
import { useState, useEffect } from 'react';

export function useResources() {
  const [ingests, setIngests] = useState<ResourcesCompactIngestResponse[]>([]);
  const [resources, setResources] = useState<ResourcesSourceResponse[]>([]);

  useEffect(() => {
    let isMounted = true;

    const getIngests = async () =>
      await fetch(`/api/manager/sources/resources`, {
        method: 'GET',
        headers: [['x-api-key', `Bearer apisecretkey`]]
      }).then(async (response) => {
        const ing = await response.json();
        if (isMounted) {
          setIngests(ing);
        }
      });
    getIngests();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (ingests) {
      for (let i = 0; i < ingests.length; i++) {
        const id = ingests[i].uuid;
        if (id) {
          fetch(`/api/manager/sources/resources/${id}`, {
            method: 'GET',
            headers: [['x-api-key', `Bearer apisecretkey`]]
          }).then(async (response) => {
            const sources = await response.json();
            setResources(sources);
          });
        }
      }
    }
  }, [ingests]);

  return [resources];
}
