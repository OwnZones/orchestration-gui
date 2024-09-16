import React from 'react';
import { ProductionsListItem } from './ProductionsListItem';
import { Production } from '../../interfaces/production';

type ProductionsListProps = {
  productions: Production[];
  locked: boolean;
};

function ProductionsList({ productions, locked }: ProductionsListProps) {
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
          locked={locked}
        />
      ))}
    </ul>
  );
}

export default ProductionsList;
