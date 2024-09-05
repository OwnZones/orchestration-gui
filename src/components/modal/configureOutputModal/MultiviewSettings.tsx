import { useEffect, useState } from 'react';
import { useMultiviewPresets } from '../../../hooks/multiviewPreset';
import { useTranslate } from '../../../i18n/useTranslate';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { MultiviewPreset } from '../../../interfaces/preset';
import Input from './Input';
import Options from './Options';
import toast from 'react-hot-toast';

type MultiviewSettingsProps = {
  multiview?: MultiviewSettings;
  handleUpdateMultiview: (multiview: MultiviewSettings) => void;
  portDuplicateError: boolean;
};

export default function MultiviewSettingsConfig({
  multiview,
  handleUpdateMultiview,
  portDuplicateError
}: MultiviewSettingsProps) {
  const t = useTranslate();
  const [multiviewPresets, loading] = useMultiviewPresets();
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] = useState<
    MultiviewPreset | undefined
  >(multiview);

  useEffect(() => {
    if (multiview) {
      setSelectedMultiviewPreset(multiview);
      return;
    }
    if (multiviewPresets && multiviewPresets[0]) {
      setSelectedMultiviewPreset(multiviewPresets[0]);
    }
  }, [multiviewPresets, multiview]);

  if (!multiview) {
    if (!multiviewPresets || multiviewPresets.length === 0) {
      return null;
    }
    handleUpdateMultiview({
      ...multiviewPresets[0],
      for_pipeline_idx: 0
    });
  }

  const handleSetSelectedMultiviewPreset = (name: string) => {
    const selected = multiviewPresets?.find((m) => m.name === name);
    if (!selected) {
      toast.error(t('preset.no_multiview_found'));
      return;
    }
    setSelectedMultiviewPreset(selected);
    handleUpdateMultiview({ ...selected, for_pipeline_idx: 0 });
  };

  const getNumber = (val: string, prev: number) => {
    if (Number.isNaN(parseInt(val))) {
      return prev;
    }
    return parseInt(val);
  };

  const handleChange = (key: string, value: string) => {
    if (!multiview) return;
    if (key === 'videoFormat') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          video_format: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'videoKiloBit') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          video_kilobit_rate: getNumber(
            value,
            multiview.output.video_kilobit_rate
          )
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'srtMode') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          srt_mode: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'port') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          local_port: getNumber(value, multiview.output.local_port),
          remote_port: getNumber(value, multiview.output.remote_port)
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'ip') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          local_ip: value,
          remote_ip: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'srtPassphrase') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          srt_passphrase: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
  };
  const multiviewPresetNames = multiviewPresets?.map((preset) => preset.name)
    ? multiviewPresets?.map((preset) => preset.name)
    : [];

  const multiviewOrPreset = multiview ? multiview : selectedMultiviewPreset;

  return (
    <div className="flex flex-col gap-2 rounded p-4">
      <div className="flex justify-between">
        <h1 className="font-bold">{t('preset.multiview_output_settings')}</h1>
      </div>
      <Options
        label={t('preset.select_multiview_preset')}
        options={multiviewPresetNames}
        value={selectedMultiviewPreset ? selectedMultiviewPreset.name : ''}
        update={(value) => handleSetSelectedMultiviewPreset(value)}
      />
      <div className="flex flex-col gap-3">
        <Options
          label={t('preset.video_format')}
          options={['AVC', 'HEVC']}
          value={
            multiviewOrPreset?.output.video_format
              ? multiviewOrPreset?.output.video_format
              : 'AVC'
          }
          update={(value) => handleChange('videoFormat', value)}
        />
        <Input
          type="number"
          label={t('preset.video_kilobit_rate')}
          value={
            multiviewOrPreset?.output.video_kilobit_rate !== undefined
              ? multiviewOrPreset?.output.video_kilobit_rate
              : '5000'
          }
          update={(value) => handleChange('videoKiloBit', value)}
        />
        <Options
          label={t('preset.mode')}
          options={['listener', 'caller']}
          value={
            multiviewOrPreset?.output.srt_mode
              ? multiviewOrPreset?.output.srt_mode
              : 'listener'
          }
          update={(value) => handleChange('srtMode', value)}
        />
        <Input
          label={t('preset.port')}
          inputError={portDuplicateError}
          value={
            multiviewOrPreset?.output.local_port
              ? multiviewOrPreset?.output.local_port
              : '1234'
          }
          update={(value) => handleChange('port', value)}
        />
        <Input
          label={t('preset.ip')}
          value={
            multiviewOrPreset?.output.local_ip
              ? multiviewOrPreset?.output.local_ip
              : '0.0.0.0'
          }
          update={(value) => handleChange('ip', value)}
        />
        <Input
          label={t('preset.srt_passphrase')}
          value={
            multiviewOrPreset?.output.srt_passphrase
              ? multiviewOrPreset?.output.srt_passphrase
              : ''
          }
          update={(value) => handleChange('srtPassphrase', value)}
        />
      </div>
    </div>
  );
}
