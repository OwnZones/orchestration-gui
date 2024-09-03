'use client';

import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { SourceReference, Type } from '../../interfaces/Source';
import { SourceThumbnail } from './SourceThumbnail';
import { useTranslate } from '../../i18n/useTranslate';
import { ISource } from '../../hooks/useDragableItems';

type SourceCardProps = {
  source?: ISource;
  label: string;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference) => void;
  onSelectingText: (bool: boolean) => void;
  forwardedRef?: React.LegacyRef<HTMLDivElement>;
  style?: object;
  src?: string;
  sourceRef?: SourceReference;
  type: Type;
};

export default function SourceCard({
  source,
  label,
  onSourceUpdate,
  onSourceRemoval,
  onSelectingText,
  forwardedRef,
  src,
  style,
  sourceRef,
  type
}: SourceCardProps) {
  const [sourceLabel, setSourceLabel] = useState(
    sourceRef?.label || source?.name
  );

  const t = useTranslate();

  const updateText = (event: ChangeEvent<HTMLInputElement>) => {
    setSourceLabel(event.currentTarget.value);
  };
  const saveText = () => {
    onSelectingText(false);
    if (sourceLabel?.length === 0) {
      if (source) {
        setSourceLabel(source.name);
      } else if (sourceRef) {
        setSourceLabel(sourceRef.label);
      }
    }

    if (source) {
      onSourceUpdate({
        _id: source._id.toString(),
        type: 'ingest_source',
        label: sourceLabel || source.name,
        input_slot: source.input_slot
      });
    } else if (sourceRef) {
      onSourceUpdate({
        _id: sourceRef._id,
        type: sourceRef.type,
        label: sourceLabel || sourceRef.label,
        input_slot: sourceRef.input_slot
      });
    }
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
          className={`absolute bg-zinc-900 text-center hover:border focus:hover:border-none w-full text-p bg-opacity-90 focus:bg-opacity-100`}
          value={source ? source.label : sourceRef?.label}
          onChange={updateText}
          onKeyDown={handleKeyDown}
          onSelect={() => {
            onSelectingText(true);
          }}
          onBlur={saveText}
        />
      </div>
      {source && source.src && (
        <SourceThumbnail source={source} src={src} type={type} />
      )}
      {!source && sourceRef && <SourceThumbnail type={sourceRef.type} />}
      {(sourceRef || source) && (
        <h2
          className={`${
            source && 'absolute bottom-4'
          } p-1 text-p text-xs bg-zinc-900 w-full bg-opacity-90 ${
            sourceRef && !source && 'absolute bottom-0'
          }`}
        >
          {t('source.input_slot', {
            input_slot:
              sourceRef?.input_slot?.toString() ||
              source?.input_slot?.toString() ||
              ''
          })}
        </h2>
      )}

      {source && (
        <h2 className="absolute bottom-0 text-p text-xs bg-zinc-900 w-full bg-opacity-90">
          {t('source.ingest', {
            ingest: source.ingest_name
          })}
        </h2>
      )}
      {(source || sourceRef) && (
        <button
          className="absolute bottom-0 right-0 text-p hover:border-l hover:border-t bg-red-700 hover:bg-red-600 min-w-fit p-1 rounded-tl-lg"
          onClick={() => {
            if (source) {
              onSourceRemoval({
                _id: source._id.toString(),
                type: 'ingest_source',
                label: sourceLabel || source.name,
                input_slot: source.input_slot,
                stream_uuids: source.stream_uuids
              });
            } else if (sourceRef && !source) {
              onSourceRemoval({
                _id: sourceRef._id,
                type: sourceRef.type,
                label: sourceRef.label,
                input_slot: sourceRef.input_slot
              });
            }
          }}
        >
          <IconTrash className="text-p w-4 h-4" />
        </button>
      )}
    </div>
  );
}
