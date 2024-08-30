import { useEffect, useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';

export function useDeleteSource(source: SourceWithId | null) {
  const [loading, setLoading] = useState(true);
  const [deleteComplete, setDeleteComplete] = useState(false);

  useEffect(() => {
    if (source && source.status === 'gone') {
      setLoading(true);
      setDeleteComplete(false);

      fetch(`/api/manager/inventory/${source._id}`, {
        method: 'PUT',
        // TODO: Implement api key
        headers: [['x-api-key', `Bearer apisecretkey`]]
      })
        .then((response) => {
          if (!response.ok) {
            setLoading(false);
            setDeleteComplete(true);
            return response.text().then((message) => {
              throw new Error(`Error ${response.status}: ${message}`);
            });
          }
          setLoading(false);
          setDeleteComplete(true);
        })
        .catch((e) => {
          console.log(`Failed to delete source-item: ${e}`);
        });
    } else {
      setLoading(false);
      setDeleteComplete(false);
    }
  }, [source]);
  return [loading, deleteComplete];
}
