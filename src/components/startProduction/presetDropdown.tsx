import { ClickAwayListener } from '@mui/base';
import { Preset } from '../../interfaces/preset';
import React, { ReactNode } from 'react';
import { Button } from '../button/Button';
import { useTranslate } from '../../i18n/useTranslate';

type presetDropdownProps = {
  isHidden: boolean;
  setHidden: (value: React.SetStateAction<boolean>) => void;
  onSelectPreset: () => void;
  selectedPreset?: Preset;
  children?: ReactNode[];
  disabled: boolean;
};

export const PresetDropdown = ({
  isHidden,
  setHidden,
  onSelectPreset,
  selectedPreset,
  children,
  disabled
}: presetDropdownProps) => {
  const t = useTranslate();

  const handleSetPresetHiddenState = (shouldHide: boolean) => {
    if (!disabled) {
      setHidden(shouldHide);
    }
  };
  return (
    <ClickAwayListener
      key={'PresetClickAwayListenerKey'}
      onClickAway={() => handleSetPresetHiddenState(true)}
    >
      <div
        className={`flex flex-row w-fit rounded items-center ${
          disabled && 'opacity-40'
        }`}
      >
        <Button
          onClick={() => handleSetPresetHiddenState(!isHidden)}
          className={`bg-container hover:bg-container text-p ${
            disabled && 'cursor-default'
          }`}
        >
          {selectedPreset ? selectedPreset.name : t('production.select_preset')}
        </Button>

        <div
          className={`relative ${
            isHidden ? 'overflow-hidden max-h-0' : 'min-h-fit max-h-[100rem]'
          } transition-all duration-150 items-center mt-1 z-30 divide-y  rounded-lg shadow bg-zinc-700 divide-gray-600 dropend`}
        >
          <ul
            className={`absolute -right-7 top-6 rounded border flex-col min-h-fit px-3 text-sm bg-container text-p`}
            id="preset-checkbox-container"
            aria-labelledby="dropdownCheckboxButton"
          >
            {selectedPreset && (
              <li
                className="flex w-40 px-1 mt-1 hover:bg-gray-600"
                onClick={onSelectPreset}
              >
                <div className="flex items-center w-full p-2 rounded hover:bg-gray-600">
                  <label className="w-full text-sm text-center font-medium">
                    {t('production.clear_selection')}
                  </label>
                </div>
              </li>
            )}
            {children}
          </ul>
        </div>
      </div>
    </ClickAwayListener>
  );
};
