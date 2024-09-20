'use client';

import React, { useState } from 'react';
import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';
import DragItem from '../dragElement/DragItem';
import SourceCard from '../sourceCard/SourceCard';
import { EmptySlotCard } from '../emptySlotCard/EmptySlotCard';
import { ISource, useDragableItems } from '../../hooks/useDragableItems';

export default function SourceCards({
  productionSetup,
  locked,
  updateProduction,
  onSourceUpdate,
  onSourceRemoval
}: {
  productionSetup: Production;
  locked: boolean;
  updateProduction: (updated: Production) => void;
  onSourceUpdate: (source: SourceReference, sourceItem: ISource) => void;
  onSourceRemoval: (source: SourceReference) => void;
}) {
  const [items, moveItem, loading] = useDragableItems(productionSetup.sources);
  const [selectingText, setSelectingText] = useState(false);
  const currentOrder: SourceReference[] = items.map((source) => {
    return {
      _id: source._id.toString(),
      label: source.label,
      input_slot: source.input_slot,
      stream_uuids: source.stream_uuids
    };
  });

  const gridItems: React.JSX.Element[] = [];
  let tempItems = [...items];
  let firstEmptySlot = items.length + 1;

  if (!items || items.length === 0) return null;
  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    if (!items.some((source) => source.input_slot === i + 1)) {
      firstEmptySlot = i + 1;
      break;
    }
  }
  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    // console.log(`On input slot: ${i + 1}`);
    // console.log(`Checking sources:`);
    // console.log(tempItems);
    tempItems.every((source) => {
      if (source.input_slot === i + 1) {
        // console.log(`Found source on input slot: ${i + 1}`);
        // console.log(`Removing source "${source.name}" from sources list`);
        tempItems = tempItems.filter((i) => i._id !== source._id);
        // console.log(`Adding source "${source.name}" to grid`);
        if (!productionSetup.isActive && !locked) {
          gridItems.push(
            <DragItem
              key={`${source.ingest_source_name}-${source.input_slot}-key`}
              id={source._id}
              onMoveItem={moveItem}
              previousOrder={productionSetup.sources}
              currentOrder={currentOrder}
              productionSetup={productionSetup}
              updateProduction={updateProduction}
              selectingText={selectingText}
            >
              <SourceCard
                source={source}
                label={source.label}
                src={source.src}
                onSourceUpdate={onSourceUpdate}
                onSourceRemoval={onSourceRemoval}
                onSelectingText={(isSelecting: boolean) =>
                  setSelectingText(isSelecting)
                }
              />
            </DragItem>
          );
        } else {
          gridItems.push(
            <SourceCard
              key={`${source.ingest_source_name}-${source.input_slot}-key`}
              source={source}
              label={source.label}
              src={source.src}
              onSourceUpdate={onSourceUpdate}
              onSourceRemoval={onSourceRemoval}
              onSelectingText={(isSelecting: boolean) =>
                setSelectingText(isSelecting)
              }
            />
          );
        }
        return false;
      } else {
        // console.log(`No source found on input slot: ${i + 1}`);
        // console.log(`Adding empty slot to grid`);
        if (productionSetup.isActive) {
          gridItems.push(
            <EmptySlotCard
              key={i}
              inputSlot={i + 1}
              isFirstEmptySlot={firstEmptySlot === i + 1}
            />
          );
        }

        return false;
      }
    });
  }
  return <>{gridItems}</>;
}
