import React, { ReactElement, memo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { SourceReference } from '../../interfaces/Source';
import { ObjectId } from 'mongodb';
import { Production } from '../../interfaces/production';
import { ISource } from '../../hooks/useDragableItems';

interface IDrag {
  id: ObjectId | string;
  selectingText: boolean;
  onMoveItem: (currentId: string, nextId: string) => void;
  children: ReactElement;
  previousOrder: SourceReference[];
  currentOrder: SourceReference[];
  updateProduction: (updated: Production) => void;
  productionSetup: Production;
}
const DragItem: React.FC<IDrag> = memo(
  ({
    id,
    selectingText,
    onMoveItem,
    children,
    previousOrder,
    currentOrder,
    updateProduction,
    productionSetup
  }) => {
    const ref = useRef(null);

    const oid = typeof id === 'string' ? id : id.toString();

    const [{ isDragging }, connectDrag] = useDrag({
      canDrag: !selectingText,
      type: 'Card',
      item: { oid },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    });

    const [, connectDrop] = useDrop({
      accept: 'Card',
      hover(hoveredOverItem: { oid: string }) {
        if (hoveredOverItem.oid !== oid) {
          onMoveItem(hoveredOverItem.oid.toString(), oid.toString());
        }
      },
      drop() {
        const isSameLength = previousOrder.length === currentOrder.length;
        const isSame = isSameLength
          ? previousOrder.every(
              (item, index) => item._id === currentOrder[index]?._id
            )
          : false;

        if (!isSame) {
          const updatedProduction = {
            ...productionSetup,
            sources: currentOrder.map((source) => ({
              ...source,
              _id: source._id || undefined
            }))
          };

          updateProduction(updatedProduction);
        }
      }
    });

    connectDrag(ref);
    connectDrop(ref);

    const containerStyle = { opacity: isDragging ? 0 : 1 };

    return (
      <>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            forwardedRef: ref,
            style: containerStyle
          })
        )}
      </>
    );
  }
);

DragItem.displayName = 'DragItem';

export default DragItem;
