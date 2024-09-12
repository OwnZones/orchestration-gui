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
): [
  (SourceReference | ISource)[],
  (originId: string, destinationId: string) => void,
  boolean
] {
  const [inventorySources, loading] = useSources();
  const [items, setItems] = useState<(SourceReference | ISource)[]>(
    sources.flatMap((ref) => {
      const refId = ref._id ? ref._id : '';
      const source = inventorySources.get(refId);
      if (!source) return [];
      return {
        ...source,
        _id: refId,
        label: ref.label,
        input_slot: ref.input_slot,
        stream_uuids: ref.stream_uuids,
        src: getSourceThumbnail(source),
        ingest_source_name: source.ingest_source_name,
        ingest_name: source.ingest_name,
        video_stream: source.video_stream,
        audio_stream: source.audio_stream,
        status: source.status,
        media_element: source.media_element,
        tags: source.tags,
        name: source.name
      };
    })
  );
  useEffect(() => {
    const updatedItems = sources.map((ref) => {
      const refId = ref._id ? ref._id : '';
      const source = inventorySources.get(refId);
      if (!source) return { ...ref };
      return {
        ...ref,
        _id: refId,
        status: source.status,
        name: source.name,
        media_element: source.media_element,
        tags: source.tags,
        ingest_name: source.ingest_name,
        ingest_source_name: source.ingest_source_name,
        ingest_type: source.ingest_type,
        label: ref.label,
        input_slot: ref.input_slot,
        stream_uuids: ref.stream_uuids,
        src: getSourceThumbnail(source),
        video_stream: source.video_stream,
        audio_stream: source.audio_stream,
        lastConnected: source.lastConnected
      };
    });
    setItems(updatedItems);
  }, [sources, inventorySources]);
  const moveItem = (originId: string, destinationId: string) => {
    const originSource = items.find(
      (item) => (item._id ? item._id.toString() : '') === originId
    );
    const destinationSource = items.find(
      (item) => (item._id ? item._id.toString() : '') === destinationId
    );
    if (!originSource || !destinationSource) return;
    const updatedItems = items
      .map((item) => {
        if (item._id === originSource._id)
          return { ...item, input_slot: destinationSource.input_slot };
        if (item._id === destinationSource._id)
          return { ...item, input_slot: originSource.input_slot };
        return item;
      })
      .sort((a, b) => a.input_slot - b.input_slot);
    setItems(updatedItems);
  };
  return [items, moveItem, loading];
}
