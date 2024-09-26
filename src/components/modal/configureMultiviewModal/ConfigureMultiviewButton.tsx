'use client';

import { useState } from 'react';
import { IconSettings } from '@tabler/icons-react';
import { Preset } from '../../../interfaces/preset';
import { useTranslate } from '../../../i18n/useTranslate';
import { Button } from '../../button/Button';
import { ConfigureMultiviewModal } from './ConfigureMultiviewModal';

type ConfigureMultiviewButtonProps = {
  preset?: Preset;
  disabled?: boolean;
  updatePreset: (preset: Preset) => void;
};

export function ConfigureMultiviewButton({
  preset,
  updatePreset,
  disabled
}: ConfigureMultiviewButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleConfigModal = () => {
    if (preset) {
      setModalOpen((state) => !state);
    }
  };
  const t = useTranslate();
  return (
    <>
      <Button
        onClick={toggleConfigModal}
        disabled={!preset || disabled}
        hoverMessage={!preset ? t('preset.preset_necessary') : ''}
        className={`min-w-fit ${
          disabled ? 'bg-button-bg/50 pointer-events-none' : 'bg-button-bg'
        }`}
      >
        Multiviewer
        <IconSettings
          className={`${disabled ? 'text-p/50' : 'text-p'} inline ml-2`}
        />
      </Button>
      {preset && (
        <ConfigureMultiviewModal
          open={modalOpen}
          preset={preset}
          onClose={toggleConfigModal}
          updatePreset={updatePreset}
        />
      )}
    </>
  );
}
