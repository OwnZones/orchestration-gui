'use client';

import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { SourceReference } from '../../interfaces/Source';
import { SourceThumbnail } from './SourceThumbnail';
import { useTranslate } from '../../i18n/useTranslate';
import { ISource } from '../../hooks/useDragableItems';
import ImageComponent from '../image/ImageComponent';
import { getSourceThumbnail } from '../../utils/source';

type SourceCardProps = {
  source: ISource;
  label: string;
  onSourceUpdate: (source: SourceReference, sourceItem: ISource) => void;
  onSourceRemoval: (source: SourceReference) => void;
  onSelectingText: (bool: boolean) => void;
  forwardedRef?: React.LegacyRef<HTMLDivElement>;
  style?: object;
  src: string;
};

export default function SourceCard({
  source,
  label,
  onSourceUpdate,
  onSourceRemoval,
  onSelectingText,
  forwardedRef,
  src,
  style
}: SourceCardProps) {
  const [sourceLabel, setSourceLabel] = useState(label ? label : source.name);

  const t = useTranslate();

  const updateText = (event: ChangeEvent<HTMLInputElement>) => {
    setSourceLabel(event.currentTarget.value);
  };
  const saveText = () => {
    onSelectingText(false);
    // if (source.name === label) {
    //   return;
    // }
    if (sourceLabel.length === 0) {
      setSourceLabel(source.name);
    }
    onSourceUpdate(
      {
        _id: source._id.toString(),
        label: sourceLabel,
        input_slot: source.input_slot
      },
      source
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  return (
    <div
      ref={forwardedRef}
      style={style}
      className="relative bg-zinc-700 aspect-video m-2 overflow-hidden cursor-pointer"
    >
      <div className="relative">
        <input
          className={`absolute z-20 bg-zinc-900 text-center hover:border focus:hover:border-none w-full text-p bg-opacity-90 focus:bg-opacity-100`}
          value={sourceLabel}
          onChange={updateText}
          onKeyDown={handleKeyDown}
          onSelect={() => {
            onSelectingText(true);
          }}
          onBlur={saveText}
        />
      </div>
      <ImageComponent src={getSourceThumbnail(source)} />
      <h2 className="z-20 absolute bottom-0 text-p text-xs bg-zinc-900 w-full bg-opacity-90">
        {t('source.ingest', {
          ingest: source.ingest_name
        })}
      </h2>
      <button
        className="z-20 absolute bottom-0 right-0 text-p hover:border-l hover:border-t bg-red-700 hover:bg-red-600 min-w-fit p-1 rounded-tl-lg"
        onClick={() => {
          onSourceRemoval({
            _id: source._id.toString(),
            label: source.label,
            input_slot: source.input_slot,
            stream_uuids: source.stream_uuids
          });
        }}
      >
        <IconTrash className="text-p w-4 h-4" />
      </button>
    </div>
  );
}
