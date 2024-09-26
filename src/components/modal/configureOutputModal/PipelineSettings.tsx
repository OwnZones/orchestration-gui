'use client';

import { useTranslate } from '../../../i18n/useTranslate';
import Input from './Input';
import Options from './Options';
import { KeyboardEvent, useState } from 'react';
import StreamAccordion from './StreamAccordion';
import { OutputStream } from './ConfigureOutputModal';
import { v4 as uuidv4 } from 'uuid';
import { IconSettings } from '@tabler/icons-react';
import PipelineOutputsModal from './PipelineOutputsModal';
import { Preset } from '../../../interfaces/preset';

interface PipelineSettingsProps {
  title: string;
  streams?: OutputStream[];
  addStream: (stream: OutputStream) => void;
  updateStream: (stream: OutputStream) => void;
  updateStreams: (streams: OutputStream[]) => void;
  deleteStream: (id: string, index: number) => void;
  updatePreset: (preset: Preset) => void;
  preset: Preset;
}
export default function PipelineSettings({
  title,
  streams,
  addStream,
  updateStream,
  updateStreams,
  deleteStream,
  updatePreset,
  preset
}: PipelineSettingsProps) {
  const t = useTranslate();
  const [showOutputConfigModal, setShowOutputConfigModal] =
    useState<boolean>(false);

  const preventCharachters = (evt: KeyboardEvent) =>
    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault();
  if (!streams) return null;

  const handleAddStream = (stream: OutputStream) => {
    addStream(stream);
  };

  const handleUpdateStream = (key: string, value: string, id: string) => {
    const getInt = (val: string) => {
      if (Number.isNaN(parseInt(value))) {
        return 0;
      }
      return parseInt(val);
    };

    if (key === 'videoBit') {
      const updatedStreams = streams.map((stream) => ({
        ...stream,
        videoBit: getInt(value)
      }));
      updateStreams(updatedStreams);
      return;
    }
    if (key === 'videoKiloBit') {
      const updatedStreams = streams.map((stream) => ({
        ...stream,
        videoKiloBit: getInt(value)
      }));
      updateStreams(updatedStreams);
      return;
    }
    if (key === 'videoFormat') {
      const updatedStreams = streams.map((stream) => ({
        ...stream,
        videoFormat: value
      }));
      updateStreams(updatedStreams);
      return;
    }
    const streamToUpdate = streams.find((stream) => stream.id === id);
    if (streamToUpdate) {
      const updatedStream = {
        ...streamToUpdate,
        [key]:
          key === 'port'
            ? getInt(value)
            : key === 'videoBit'
            ? getInt(value)
            : key === 'videoKiloBit'
            ? getInt(value)
            : value
      };
      updateStream(updatedStream);
    }
  };

  const handleDeleteStream = (id: string, index: number) => {
    deleteStream(id, index);
  };
  return (
    <div className="flex flex-col gap-2 rounded p-4">
      <h1 className="font-bold">{title}</h1>
      {/* <div className="flex flex-col gap-3"> */}
      {/* <Options
          label={t('preset.video_format')}
          options={['AVC', 'HEVC']}
          value={streams[0].videoFormat}
          update={(value) =>
            handleUpdateStream('videoFormat', value, streams[0].id)
          }
        />
        <Options
          options={['8', '10']}
          label={t('preset.video_bit_depth')}
          value={streams[0].videoBit.toString()}
          update={(value) =>
            handleUpdateStream('videoBit', value, streams[0].id)
          }
        />

        <Input
          onKeyDown={preventCharachters}
          type="number"
          label={t('preset.video_kilobit_rate')}
          value={streams[0].videoKiloBit}
          update={(value) =>
            handleUpdateStream('videoKiloBit', value, streams[0].id)
          }
        />
      </div>
      <div className="flex flex-col gap-3">
        {streams.map((stream) => {
          return (
            <StreamAccordion
              isOnlyStream={streams.length === 1}
              key={stream.id}
              stream={stream}
              update={handleUpdateStream}
              onDelete={handleDeleteStream}
            />
          );
        })}
      </div>
      <button
        onClick={() =>
          handleAddStream({
            ...streams[0],
            name: '',
            id: uuidv4(),
            ip: '0.0.0.0',
            srtMode: 'listener'
          })
        }
        className="rounded-xl p-1 border border-gray-600 focus:border-gray-400 focus:outline-none hover:border-gray-500"
      >
        {t('preset.add_stream')}
      </button> */}
      <button
        onClick={() => setShowOutputConfigModal(true)}
        className="flex flex-row justify-center rounded-xl p-1 border border-gray-600 focus:border-gray-400 focus:outline-none hover:border-gray-500"
      >
        <IconSettings className="text-p mr-2" />
        {t('production.configure_outputs')}
      </button>
      {showOutputConfigModal && (
        <PipelineOutputsModal
          closeModal={() => setShowOutputConfigModal(false)}
          name={title}
          updatePreset={updatePreset}
          preset={preset}
        />
      )}
    </div>
  );
}
