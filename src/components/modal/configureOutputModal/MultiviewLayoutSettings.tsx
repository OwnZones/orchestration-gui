import { useEffect, useState } from 'react';
import { useMultiviewPresets } from '../../../hooks/multiviewPreset';
import Options from './Options';
import { MultiviewPreset } from '../../../interfaces/preset';
import { useTranslate } from '../../../i18n/useTranslate';
import {
  MultiviewViewsWithId,
  useSetupMultiviewLayout
} from '../../../hooks/useSetupMultiviewLayout';
import { Production } from '../../../interfaces/production';
import { useConfigureMultiviewLayout } from '../../../hooks/useConfigureMultiviewLayout';
import { SourceReference } from '../../../interfaces/Source';
import Input from './Input';

type ChangeLayout = {
  defaultLabel?: string;
  source?: SourceReference;
  id: number;
};

export default function MultiviewLayoutSettings({
  // configMode sets the mode of the configuration to create or edit, not implemented yet
  configMode,
  production,
  setNewMultiviewPreset
}: {
  configMode: string;
  production: Production | undefined;
  setNewMultiviewPreset: (preset: MultiviewPreset | null) => void;
}) {
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] =
    useState<MultiviewPreset | null>(null);
  const [changedLayout, setChangedLayout] = useState<ChangeLayout | null>(null);
  const [newPresetName, setNewPresetName] = useState<string | null>(null);
  const [multiviewPresets, loading] = useMultiviewPresets();
  const { multiviewPresetLayout } = useSetupMultiviewLayout(
    selectedMultiviewPreset
  );
  const { multiviewLayout } = useConfigureMultiviewLayout(
    selectedMultiviewPreset,
    changedLayout?.defaultLabel,
    changedLayout?.source,
    changedLayout?.id,
    configMode,
    newPresetName
  );
  const t = useTranslate();

  const multiviewPresetNames = multiviewPresets?.map((preset) => preset.name)
    ? multiviewPresets?.map((preset) => preset.name)
    : [];

  useEffect(() => {
    setNewPresetName(null);
  }, [configMode]);

  useEffect(() => {
    if (multiviewPresets && multiviewPresets[0]) {
      setSelectedMultiviewPreset(multiviewPresets[0]);
    }
  }, [multiviewPresets]);

  useEffect(() => {
    if (multiviewLayout) {
      setSelectedMultiviewPreset(multiviewLayout);
      setNewMultiviewPreset(multiviewLayout);
    } else {
      setSelectedMultiviewPreset(null);
      setNewMultiviewPreset(null);
    }
  }, [multiviewLayout]);

  const handlePresetUpdate = (name: string) => {
    const presetLayout = multiviewPresets?.find(
      (singlePreset) => singlePreset.name === name
    );
    setNewPresetName(name);
    if (presetLayout) {
      setSelectedMultiviewPreset(presetLayout);
    }
  };

  const handleChange = (id: number | undefined, value: string) => {
    if (production && id && multiviewPresets) {
      // Remove 2 from id to remove id for Preview- and Program-view
      // Add 1 to index to get the correct input_slot
      const idFirstInputView = id - 2 + 1;
      const defaultLabel = multiviewPresets[0].layout.views.find(
        (item) => item.input_slot === idFirstInputView
      )?.label;
      production.sources.map((source) => {
        if (value === '') {
          setChangedLayout({ defaultLabel, id });
        }
        if (source.label === value) {
          setChangedLayout({ source, id });
        }
      });
    }
  };

  const renderPresetModel = () => {
    if (multiviewPresetLayout) {
      return (
        <div
          className={`border-4 border-p/50 relative p-2 m-2`}
          style={{
            width: `${multiviewPresetLayout.layout.output_width}rem`,
            height: `${multiviewPresetLayout.layout.output_height}rem`
          }}
        >
          {multiviewPresetLayout.layout.views.map(
            (singleView: MultiviewViewsWithId) => {
              const { x, y, width, height, label, id } = singleView;
              const previewView = singleView.input_slot === 1002;
              const programView = singleView.input_slot === 1001;

              return (
                <div
                  key={x + y}
                  className="flex items-center justify-center border-[1px] border-p/50 absolute w-full"
                  style={{
                    width: `${width}rem`,
                    height: `${height}rem`,
                    top: `${y}rem`,
                    left: `${x}rem`
                  }}
                >
                  {production && (previewView || programView) && (
                    <p className="flex items-center">{label}</p>
                  )}
                  {production && !previewView && !programView && (
                    <Options
                      label={label}
                      options={production.sources.map(
                        (singleSource) => singleSource.label
                      )}
                      value={label ? label : ''}
                      update={(value) => handleChange(id, value)}
                      columnStyle
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {renderPresetModel()}
      <div className="flex flex-col w-[50%] h-full">
        <Options
          label={t('preset.select_multiview_preset')}
          options={multiviewPresetNames}
          value={selectedMultiviewPreset ? selectedMultiviewPreset.name : ''}
          update={(value) => handlePresetUpdate(value)}
        />
        <Input
          label={t('name')}
          value={newPresetName ? newPresetName : ''}
          update={(value) => handlePresetUpdate(value)}
          placeholder={t('preset.new_preset_name')}
        />
      </div>
    </div>
  );
}
