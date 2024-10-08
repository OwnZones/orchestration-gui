import { useEffect, useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';

export function useSources(
  reloadList?: boolean,
  updatedSource?: SourceWithId
): [Map<string, SourceWithId>, boolean] {
  const [sources, setSources] = useState<Map<string, SourceWithId>>(
    new Map<string, SourceWithId>()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!updatedSource || reloadList) {
      fetch('/api/manager/sources?mocked=false', {
        method: 'GET',
        // TODO: Implement api key
        headers: [['x-api-key', `Bearer apisecretkey`]]
      })
        .then(async (response) => {
          if (response.ok) {
            const fetchedSources = (await response.json()) as SourceWithId[];
            const sourceMap = new Map<string, SourceWithId>();
            fetchedSources
              .sort((a, b) => (a.status === 'gone' ? 1 : -1))
              .map((source) => sourceMap.set(source._id.toString(), source));
            setSources(sourceMap);
          }
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    sources.set(updatedSource._id.toString(), updatedSource);
    setSources(new Map<string, SourceWithId>(sources));
  }, [updatedSource, reloadList]);
  return [sources, loading];
}
