import { useEffect, useState } from 'react';
import { MultiviewPreset, TMultiviewLayout } from '../interfaces/preset';
import { MultiviewViews, TListSource } from '../interfaces/multiview';

export function useConfigureMultiviewLayout(
  productionId: string | undefined,
  preset: MultiviewPreset | null,
  defaultLabel: string | undefined,
  source: TListSource | undefined,
  viewId: string | undefined,
  name: string | null
) {
  const [updatedPreset, setUpdatedPreset] = useState<TMultiviewLayout | null>(
    null
  );

  useEffect(() => {
    if (productionId && preset && (defaultLabel || source)) {
      console.log('production ID - layout hook', productionId);
      const arr: MultiviewViews[] = [];
      preset.layout.views.map((item, index) => {
        if (index.toString() === viewId) {
          if (source) {
            arr.push({
              ...item,
              input_slot: source.input_slot,
              label: source.label,
              id: source.id
            });
          }
          if (defaultLabel) {
            arr.push({
              ...item,
              input_slot: parseInt(viewId, 10),
              label: defaultLabel
            });
          }
        } else {
          arr.push({
            ...item
          });
        }
      });
      return setUpdatedPreset({
        ...preset,
        productionId,
        name: name || preset.name,
        layout: {
          ...preset.layout,
          views: arr
        }
      });
    }
  }, [defaultLabel, name, source, viewId]);

  return { multiviewLayout: updatedPreset };
}
