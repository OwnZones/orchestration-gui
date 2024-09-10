'use client';
import { useState, Suspense } from 'react';
import { LockButton } from '../lockButton/LockButton';
import { useTranslate } from '../../i18n/useTranslate';
import HeaderNavigation from '../headerNavigation/HeaderNavigation';
import Inventory from './Inventory';

export const InventoryPageContent = () => {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const t = useTranslate();

  return (
    <>
      <HeaderNavigation>
        <div className="flex justify-center items-center w-full">
          <div className="flex space-x-8">
            <h1 className="m-2 text-4xl text-p text-center">
              {t('inventory')}
            </h1>
            <LockButton
              isLocked={isLocked}
              onClick={() => setIsLocked(!isLocked)}
            />
          </div>
        </div>
      </HeaderNavigation>
      <Suspense>
        <Inventory isLocked={isLocked} />
      </Suspense>
    </>
  );
};
