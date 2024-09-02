import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Source, SourceWithId } from '../../interfaces/Source';
import { PreviewThumbnail } from './PreviewThumbnail';
import { getSourceThumbnail } from '../../utils/source';
import videoSettings from '../../utils/videoSettings';
import { getHertz } from '../../utils/stream';
import { useTranslate } from '../../i18n/useTranslate';
import Icons from '../icons/Icons';
import NumbersRow from '../inventory/editView/AudioChannels/NumbersRow';
import Outputs from '../inventory/editView/AudioChannels/Outputs';
import { mapAudio } from '../../utils/audioMapping';
import { oneBased } from '../inventory/editView/AudioChannels/utils';
import capitalize from '../../utils/capitalize';

type SourceListItemProps = {
  source: SourceWithId;
  action: (source: SourceWithId) => void;
  edit?: boolean;
  disabled: unknown;
};

const getIcon = (source: Source) => {
  const isGone = source.status === 'gone';
  const className = isGone ? 'text-error' : 'text-brand';

  const types = {
    camera: (
      <Icons
        name={isGone ? 'IconVideoOff' : 'IconVideo'}
        className={className}
      />
    ),
    microphone: (
      <Icons
        name={isGone ? 'IconMicrophone2Off' : 'IconMicrophone2'}
        className={className}
      />
    ),
    graphics: (
      <Icons
        name={isGone ? 'IconVectorOff' : 'IconVector'}
        className={className}
      />
    )
  };

  return types[source.type];
};

function InventoryListItem({
  source,
  action,
  disabled,
  edit = false
}: SourceListItemProps) {
  const t = useTranslate();
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [outputRows, setOutputRows] = useState<
    { id: string; value: string }[][]
  >([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { video_stream: videoStream, audio_stream: audioStream } = source;
  const { width, height, frame_rate: frameRate } = videoStream || {};
  const { sample_rate: sampleRate, number_of_channels: numberOfChannels = 0 } =
    audioStream || {};

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const onMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => setPreviewVisible(true), 1000);
  }, []);

  const onMouseLeave = useCallback(() => {
    setPreviewVisible(false);
    clearTimeout(timeoutRef.current);
  }, []);

  const style = { textWrap: 'wrap' } as React.CSSProperties;

  const channelsInArray: number[] = [];
  for (let i = 1; i <= numberOfChannels; i++) {
    channelsInArray.push(i);
  }

  useEffect(() => {
    const audioMapping = source?.audio_stream.audio_mapping;

    if (audioMapping) {
      setOutputRows(() =>
        audioMapping.length
          ? mapAudio(oneBased(audioMapping), channelsInArray)
          : []
      );
    }
  }, [source.audio_stream.audio_mapping]);

  return (
    <li
      className={`relative w-full items-center border-b border-gray-600 ${
        disabled ? 'bg-unclickable-bg' : 'hover:bg-zinc-700'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {source.status !== 'gone' &&
        source.type === 'camera' &&
        previewVisible && <PreviewThumbnail src={getSourceThumbnail(source)} />}
      <div className="flex">
        <div className="flex flex-row flex-1 items-center space-x-4 p-3 sm:pb-4 ">
          <div className="flex flex-row">{getIcon(source)}</div>
          <div
            style={style}
            className={`flex flex-col ${
              disabled ? 'text-unclickable-text' : 'text-p'
            }`}
          >
            <h2 className="text-sm mb-2">{source.name}</h2>
            <h2 className="text-sm">
              {t('source.type', { type: capitalize(source.type) })}
            </h2>
            <h2 className="text-sm">
              {t('source.location', {
                location:
                  source.tags.location === 'Unknown'
                    ? t('source.location_unknown')
                    : capitalize(source.tags.location)
              })}
            </h2>
            <h2 className="text-sm">
              {t('source.last_connected')}:{' '}
              {new Date(source.lastConnected).toLocaleString()}
            </h2>
            <h2 className="text-xs">
              {t('source.ingest', {
                ingest: source.ingest_name
              })}
            </h2>
            <h2 className="text-xs">
              {t('source.orig', {
                name: source.ingest_source_name
              })}
            </h2>
            {width && height ? (
              <h2 className="text-xs">
                {t('source.video', {
                  video: videoSettings(width, height, frameRate)
                })}
              </h2>
            ) : null}
            {sampleRate ? (
              <h2 className="text-xs mb-2">
                {t('source.audio', {
                  audio: getHertz(sampleRate)
                })}
              </h2>
            ) : null}

            {outputRows.length > 1 ? (
              <div className="text-gray-200 text-xs	 flex flex-col relative">
                <NumbersRow small numbers={channelsInArray} />
                {outputRows.map((contents, rowIndex) => (
                  <div className="flex" key={rowIndex}>
                    <Outputs
                      small
                      contents={contents}
                      outputRows={outputRows}
                      rowIndex={rowIndex}
                      max={channelsInArray[channelsInArray.length - 1]}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center items-center	">
          {!disabled ? (
            <div className="relative w-full mr-4">
              <button
                className={`flex flex-row min-w-full items-center justify-center m-1 p-1 rounded-lg ${
                  disabled
                    ? 'text-unclickable-text'
                    : 'text-brand hover:bg-zinc-500'
                } bg-zinc-600`}
                onClick={() => (disabled ? '' : action(source))}
              >
                <div
                  className={`flex items-center overflow-hidden mr-6 ${
                    disabled ? 'text-unclickable-text' : 'text-brand'
                  } text-xs`}
                >
                  {edit ? t('inventory_list.edit') : t('inventory_list.add')}
                </div>
                <Icons
                  name="IconArrowRight"
                  className={`absolute ${
                    disabled ? 'text-unclickable-text' : 'text-brand'
                  } right-2 w-4`}
                />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default InventoryListItem;
