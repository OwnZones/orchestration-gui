import {
  ResourcesIngestResponse,
  ResourcesSourceResponse
} from '../../../types/agile-live';
import { useState, useEffect } from 'react';

export function useResources() {
  const [ingests, setIngests] = useState<ResourcesIngestResponse[]>([]);
  const [resources, setResources] = useState<ResourcesSourceResponse[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchSources = async () => {
      try {
        const response = await fetch(`/api/manager/sources/resourceSource`, {
          method: 'GET',
          headers: [['x-api-key', `Bearer apisecretkey`]]
        });

        if (!response.ok) {
          throw new Error('Error');
        }

        const ing = await response.json();
        if (isMounted) {
          setIngests(ing);
        }
      } catch (e) {
        console.log('ERROR');
      }
    };
    fetchSources();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (ingests) {
      for (let i = 0; i < ingests.length; i++) {
        const id = ingests[i].uuid;
        if (id) {
          fetch(`/api/manager/resources/${id}`, {
            method: 'GET',
            headers: [['x-api-key', `Bearer apisecretkey`]]
          }).then(async (response) => {
            console.log('RESPONSE: ', response);
            const sources = await response.json();
            setResources(sources);
          });
        }
      }
    }
  }, [ingests]);

  return [resources];
}
