'use client';
import { CreateProduction } from '../createProduction/CreateProduction';
import { Suspense, useContext } from 'react';
import { LoadingCover } from '../loader/LoadingCover';
import ProductionsList from '../productionsList/ProductionsList';
import { Production } from '../../interfaces/production';
import { GlobalContext } from '../../contexts/GlobalContext';

type HomePageContentProps = {
  productions: Production[];
};

export const HomePageContent = ({ productions }: HomePageContentProps) => {
  const { locked } = useContext(GlobalContext);

  return (
    <div>
      <CreateProduction />
      <div className="flex items-center w-full">
        <Suspense fallback={<LoadingCover />}>
          <ProductionsList productions={productions} locked={locked} />
        </Suspense>
      </div>
    </div>
  );
};
