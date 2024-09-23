import { useState } from 'react';
import { Production } from '../interfaces/production';
import { CallbackHook } from './types';

export function useGetFirstEmptySlot(): CallbackHook<
  (productionSetup?: Production | undefined) => number
> {
  const [loading, setLoading] = useState(true);

  const findFirstEmptySlot = (productionSetup: Production | undefined) => {
    if (!productionSetup) throw 'no_production';

    if (productionSetup) {
      let firstEmptySlotTemp = productionSetup.sources.length + 1;
      if (productionSetup.sources.length === 0) {
        return firstEmptySlotTemp;
      }
      for (
        let i = 0;
        i <
        productionSetup.sources[productionSetup.sources.length - 1].input_slot;
        i++
      ) {
        if (
          !productionSetup.sources.some((source) => source.input_slot === i + 1)
        ) {
          firstEmptySlotTemp = i + 1;
          break;
        }
      }
      return firstEmptySlotTemp;
    } else {
      return 0;
    }
  };
  return [findFirstEmptySlot, loading];
}
