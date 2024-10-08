import { useEffect, useState } from 'react';
import { MultiviewPreset } from '../interfaces/preset';
import { MultiviewViews } from '../interfaces/multiview';

export type MultiviewViewsWithId = MultiviewViews & { id?: number };

export function useSetupMultiviewLayout(preset: MultiviewPreset | null) {
  const [multiviewPreset, setMultiviewPreset] = useState<MultiviewPreset>();
  useEffect(() => {
    if (preset) {
      const downScale = 30;
      const arr: MultiviewViewsWithId[] = [];
      preset.layout.views.map((item, index) => {
        arr.push({
          ...item,
          x: item.x / downScale,
          y: item.y / downScale,
          height: item.height / downScale,
          width: item.width / downScale,
          id: index
        });
      });
      return setMultiviewPreset({
        ...preset,
        layout: {
          ...preset.layout,
          output_height: preset.layout.output_height / downScale + 0.5,
          output_width: preset.layout.output_width / downScale + 0.5,
          views: arr
        }
      });
    }
  }, [preset]);
  return { multiviewPresetLayout: multiviewPreset };
}
