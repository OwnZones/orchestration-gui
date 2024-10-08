import React from 'react';
import { IconVideoPlus } from '@tabler/icons-react';
import { useTranslate } from '../../i18n/useTranslate';

type AddInputProps = {
  onClickSource: () => void;
  disabled: boolean;
};

export function AddInput({ onClickSource, disabled }: AddInputProps) {
  const t = useTranslate();

  return (
    <div
      className={`bg-zinc-700 m-2 p-2 text-p rounded gap-2 justify-center items-center ${
        disabled ? 'opacity-10' : 'opacity-100'
      }`}
    >
      <button
        className="flex flex-row bg-button-bg p-2 rounded"
        onClick={() => {
          !disabled && onClickSource();
        }}
      >
        <IconVideoPlus className="mr-2" />
        <span>{t('production.add_source')}</span>
      </button>
    </div>
  );
}
