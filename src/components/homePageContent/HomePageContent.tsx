'use client';
import { CreateProduction } from '../createProduction/CreateProduction';
import { Suspense, useState } from 'react';
import { LoadingCover } from '../loader/LoadingCover';
import ProductionsList from '../productionsList/ProductionsList';
import { Production } from '../../interfaces/production';

type HomePageContentProps = {
  productions: Production[];
};

export const HomePageContent = ({ productions }: HomePageContentProps) => {
  const [isLocked, setIsLocked] = useState<boolean>(true);

  return (
    <div>
      <CreateProduction
        isLocked={isLocked}
        onClick={() => setIsLocked(!isLocked)}
      />
      <div className="flex items-center w-full">
        <Suspense fallback={<LoadingCover />}>
          <ProductionsList productions={productions} isLocked={isLocked} />
        </Suspense>
      </div>
    </div>
  );
};
