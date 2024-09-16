'use client';

import Link from 'next/link';
import { useTranslate } from '../../i18n/useTranslate';
import { useContext } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';
import { IconRefresh } from '@tabler/icons-react';

export default function HeaderNavigation({
  children
}: {
  children: React.ReactNode;
}) {
  const t = useTranslate();
  const { incrementImageRefetchIndex } = useContext(GlobalContext);
  return (
    <div className="flex flex-row justify-between">
      <div className="flex m-2 rounded align-center">
        <Link
          className="bg-button-bg hover:bg-button-hover-bg text-button-text font-bold py-2 px-4 rounded inline-flex items-center"
          href={'/'}
        >
          <span>{t('homepage')}</span>
        </Link>
        <button
          className="bg-button-bg hover:bg-button-hover-bg text-button-text font-bold py-2 px-4 rounded inline-flex items-center ml-2"
          onClick={incrementImageRefetchIndex}
        >
          <IconRefresh
            className="text-white mr-1"
            onClick={incrementImageRefetchIndex}
          />
          {t('refresh_images')}
        </button>
      </div>
      {children}
    </div>
  );
}
