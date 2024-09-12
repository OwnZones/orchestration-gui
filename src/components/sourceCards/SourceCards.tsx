'use client';
import React, { useState } from 'react';
import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';
import DragItem from '../dragElement/DragItem';
import SourceCard from '../sourceCard/SourceCard';
import { ISource, useDragableItems } from '../../hooks/useDragableItems';
export default function SourceCards({
  productionSetup,
  updateProduction,
  onSourceUpdate,
  onSourceRemoval
}: {
  productionSetup: Production;
  updateProduction: (updated: Production) => void;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference) => void;
}) {
  const [items, moveItem] = useDragableItems(productionSetup.sources);
  const [selectingText, setSelectingText] = useState(false);
  if (!items) return null;
  const isISource = (source: SourceReference | ISource): source is ISource => {
    return 'src' in source;
  };

  const sourceReferences = items.filter(
    // (item): item is SourceReference => item.type !== 'ingest_source'
    (item) =>
      (item as SourceReference).type === 'html' ||
      (item as SourceReference).type === 'mediaplayer'
  );

  const gridItems = items.map((source) => {
    const id = source._id ? source._id : '';
    const isSource = isISource(source);
    return (
      <DragItem
        key={id === typeof String ? id : id.toString()}
        id={id}
        onMoveItem={moveItem}
        previousOrder={productionSetup.sources}
        currentOrder={sourceReferences}
        productionSetup={productionSetup}
        updateProduction={updateProduction}
        selectingText={selectingText}
      >
        {isSource ? (
          <SourceCard
            source={source}
            label={source.label}
            src={source.src}
            onSourceUpdate={onSourceUpdate}
            onSourceRemoval={onSourceRemoval}
            onSelectingText={(isSelecting) => setSelectingText(isSelecting)}
            type={'ingest_source'}
          />
        ) : (
          <SourceCard
            sourceRef={source}
            label={source.label}
            onSourceUpdate={onSourceUpdate}
            onSourceRemoval={onSourceRemoval}
            onSelectingText={(isSelecting) => setSelectingText(isSelecting)}
            type={source.type}
          />
        )}
      </DragItem>
    );
  });
  return <>{gridItems}</>;
}
