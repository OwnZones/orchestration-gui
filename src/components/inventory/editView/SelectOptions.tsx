import React from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import { en } from '../../../i18n/locales/en';
import capitalize from '../../../utils/capitalize';

export type SelectOptionsProps = {
  name: keyof typeof en;
  options: string[];
  selected: string;
  disabled?: boolean;
  onChange: (e: { target: { value: string } }) => void;
};

export default function SelectOptions({
  name,
  options,
  selected,
  disabled,
  onChange
}: SelectOptionsProps) {
  const t = useTranslate();

  return (
    <>
      <h2 className="flex w-[100px] items-center">{t(name)}</h2>
      <input
        className={`${
          disabled
            ? 'bg-gray-700/50 border-gray-600/50 placeholder-gray-400/50 text-p/50 pointer-events-none'
            : 'bg-gray-700 border-gray-600 placeholder-gray-400 text-p'
        } cursor-pointer ml-5 border justify-center text-sm rounded-lg w-full pl-2 pt-1 pb-1 focus:ring-blue-500 focus:border-blue-500`}
        list={name + 'list'}
        id={name}
        onChange={onChange}
        value={capitalize(selected)}
        disabled={disabled}
      />
      <datalist id={name + 'list'}>
        {options.map((option: string, index: number) => (
          <option key={option + index} value={capitalize(option)} />
        ))}
      </datalist>
    </>
  );
}
