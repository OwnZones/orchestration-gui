import { useState } from 'react';
import { addSetupItem } from '../items/addSetupItem';
import { CallbackHook } from '../types';
import { Production } from '../../interfaces/production';
import { usePutProduction } from '../productions';
import { SourceReference } from '../../interfaces/Source';

export function useAddSource(): CallbackHook<
  (
    input: SourceReference,
    productionSetup: Production
  ) => Promise<Production | undefined>
> {
  const [loading, setLoading] = useState(true);
  const putProduction = usePutProduction();

  const addSource = async (
    input: SourceReference,
    productionSetup: Production
  ) => {
    const updatedSetup = addSetupItem(
      {
        _id: input._id ? input._id : undefined,
        type: input.type || 'ingest_source',
        label: input.label,
        input_slot: input.input_slot
      },
      productionSetup
    );

    if (!updatedSetup) return;

    const res = await putProduction(updatedSetup._id.toString(), updatedSetup);
    return res;
  };

  return [addSource, loading];
}
