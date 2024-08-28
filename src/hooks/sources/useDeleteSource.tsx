import { useEffect, useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';

export function useDeleteSource(source: SourceWithId | null) {
  const [loading, setLoading] = useState(true);
  const [deleteComplete, setDeleteComplete] = useState(false);

  useEffect(() => {
    if (source && source.status === 'gone') {
      setLoading(true);
      setDeleteComplete(false);
      // Source to be deleted:
      console.log('source._id', source);
      fetch(`/api/manager/inventory/${source._id}`, {
        method: 'DELETE',
        // TODO: Implement api key
        headers: [['x-api-key', `Bearer apisecretkey`]]
      })
        .then((response) => {
          if (response.ok) {
            setLoading(false);
            setDeleteComplete(true);
          }
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
