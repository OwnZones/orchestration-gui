import React from 'react';
import { ProductionsListItem } from './ProductionsListItem';
import { Production } from '../../interfaces/production';

type ProductionsListProps = {
  productions: Production[];
  isLocked: boolean;
};

function ProductionsList({ productions, isLocked }: ProductionsListProps) {
  productions
    .sort((a, b) => {
      return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
    })
    .map((production) => ({ ...production, _id: production._id.toString() }));
  return (
    <ul className="w-full">
      {productions.map((production) => (
        <ProductionsListItem
          key={`${production._id}`}
          production={production}
          isLocked={isLocked}
        />
      ))}
    </ul>
  );
}

export default ProductionsList;
