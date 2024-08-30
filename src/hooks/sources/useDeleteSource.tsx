import { useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';
import { CallbackHook } from '../types';

export function useDeleteSource(): CallbackHook<
  (source: SourceWithId) => void
> {
  const [deleteComplete, setDeleteComplete] = useState(false);

  const setSourceToPurge = (source: SourceWithId) => {
    if (source && source.status === 'gone') {
      setDeleteComplete(false);

      fetch(`/api/manager/inventory/${source._id}`, {
        method: 'PUT',
        // TODO: Implement api key
        headers: [['x-api-key', `Bearer apisecretkey`]]
      })
        .then((response) => {
          if (!response.ok) {
            setDeleteComplete(true);
            return response.text().then((message) => {
              throw new Error(`Error ${response.status}: ${message}`);
            });
          }
          setDeleteComplete(true);
        })
        .catch((e) => {
          console.log(`Failed to delete source-item: ${e}`);
        });
    } else {
      setDeleteComplete(false);
    }
  };
  return [setSourceToPurge, deleteComplete];
}
