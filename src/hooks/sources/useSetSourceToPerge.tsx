import { useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';
import { CallbackHook } from '../types';
import { Log } from '../../api/logger';

export function useSetSourceToPerge(): CallbackHook<
  (source: SourceWithId) => void
> {
  const [reloadList, setReloadList] = useState(false);

  const removeInventorySource = (source: SourceWithId) => {
    if (source && source.status === 'gone') {
      setReloadList(false);

      fetch(`/api/manager/inventory/${source._id}`, {
        method: 'PUT',
        // TODO: Implement api key
        headers: [['x-api-key', `Bearer apisecretkey`]]
      })
        .then((response) => {
          if (!response.ok) {
            setReloadList(true);
            Log().error(
              `Failed to set ${source.name} with id:  ${source._id} to purge`
            );
          } else {
            console.log(
              `${source.name} with id: ${source._id} is set to purge`
            );
          }
          setReloadList(true);
        })
        .catch((e) => {
          Log().error(
            `Failed to set ${source.name} with id:  ${source._id} to purge: ${e}`
          );
          throw `Failed to set ${source.name} with id:  ${source._id} to purge: ${e}`;
        });
    } else {
      setReloadList(false);
    }
  };
  return [removeInventorySource, reloadList];
}
