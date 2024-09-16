'use client';
import { Suspense, useContext } from 'react';
import { LockButton } from '../lockButton/LockButton';
import { useTranslate } from '../../i18n/useTranslate';
import HeaderNavigation from '../headerNavigation/HeaderNavigation';
import Inventory from './Inventory';
import { GlobalContext } from '../../contexts/GlobalContext';

export const InventoryPageContent = () => {
  const t = useTranslate();
  const { locked } = useContext(GlobalContext);

  return (
    <>
      <HeaderNavigation>
        <div className="flex justify-center items-center w-full">
          <div className="flex space-x-8">
            <h1 className="m-2 text-4xl text-p text-center">
              {t('inventory')}
            </h1>
            <LockButton />
          </div>
        </div>
      </HeaderNavigation>
      <Suspense>
        <Inventory locked={locked} />
      </Suspense>
    </>
  );
};
