'use client';

import React, { useState } from 'react';
import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';
import DragItem from '../dragElement/DragItem';
import SourceCard from '../sourceCard/SourceCard';
import { ISource, useDragableItems } from '../../hooks/useDragableItems';
export default function SourceCards({
  productionSetup,
  sourceRef,
  updateProduction,
  onSourceUpdate,
  onSourceRemoval
}: {
  productionSetup: Production;
  sourceRef?: SourceReference;
  updateProduction: (updated: Production) => void;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference) => void;
}) {
  const [items, moveItem, loading] = useDragableItems(productionSetup.sources);
  const referenceItems = productionSetup.sources;
  const [selectingText, setSelectingText] = useState(false);

  if (loading || !items) return null;

  // Filter SourceReference and ISource objects correctly
  const sourceReferences = items.filter(
    (item): item is SourceReference => item.type !== 'ingest_source'
  );

  const isISource = (source: SourceReference | ISource): source is ISource => {
    // Use properties unique to ISource to check the type
    return 'src' in source;
  };

  const gridItems = items.map((source) => {
    const isSource = isISource(source);

    return (
      <DragItem
        key={source._id.toString()}
        id={source._id.toString()}
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
            sourceRef={sourceRef}
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
