import { useEffect, useState } from 'react';
import { SourceReference, SourceWithId } from '../interfaces/Source';
import { useSources } from './sources/useSources';
import { getSourceThumbnail } from '../utils/source';

export interface ISource extends SourceWithId {
  label: string;
  input_slot: number;
  stream_uuids?: string[];
  src: string;
}
export function useDragableItems(
  sources: SourceReference[]
): [ISource[], (originId: string, destinationId: string) => void, boolean] {
  const [inventorySources, loading] = useSources();
  const [items, setItems] = useState<ISource[]>(
    sources.flatMap((ref) => {
      const refId = ref._id ? ref._id : '';
      const source = inventorySources.get(refId);
      if (!source) return [];
      return {
        ...source,
        label: ref.label,
        input_slot: ref.input_slot,
        stream_uuids: ref.stream_uuids,
        src: getSourceThumbnail(source)
      };
    })
  );

  useEffect(() => {
    setItems(
      sources.flatMap((ref) => {
        const refId = ref._id ? ref._id : '';
        const source = inventorySources.get(refId);
        if (!source) return [];
        return {
          ...source,
          label: ref.label,
          input_slot: ref.input_slot,
          stream_uuids: ref.stream_uuids,
          src: getSourceThumbnail(source)
        };
      })
    );
  }, [sources, inventorySources]);

  const moveItem = (originId: string, destinationId: string) => {
    const originSource = items.find((i) => i._id.toString() === originId);
    const destinationSource = items.find(
      (i) => i._id.toString() === destinationId
    );
    if (!originSource || !destinationSource) return;
    const originInputSlot = originSource.input_slot;
    const destinationInputSlot = destinationSource.input_slot;
    originSource.input_slot = destinationInputSlot;
    destinationSource.input_slot = originInputSlot;
    const updatedItems = [
      ...items.filter(
        (i) => i._id !== originSource._id && i._id !== destinationSource._id
      ),
      originSource,
      destinationSource
    ].sort((a, b) => a.input_slot - b.input_slot);
    setItems(updatedItems);
  };

  return [items, moveItem, loading];
}
