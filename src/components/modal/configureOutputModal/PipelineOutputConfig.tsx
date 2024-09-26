import { useEffect, useState, KeyboardEvent } from 'react';
import { ResourcesNameAndUUIDResponse } from '../../../../types/ateliere-live';
import { useTranslate } from '../../../i18n/useTranslate';
import Input from './Input';
import {
  PipelineOutput,
  PipelineOutputEncoderSettings,
  PipelineOutputSettings
} from '../../../interfaces/pipeline';
import StreamAccordion from './StreamAccordion';
import { OutputStream } from './ConfigureOutputModal';
import Options from './Options';
import cloneDeep from 'lodash.clonedeep';

interface PipelineOutputConfigProps {
  title: string;
  outputs: ResourcesNameAndUUIDResponse[];
  pipelineOutputs: PipelineOutput[];
  updatePipelineOutputs: (outputs: PipelineOutput[]) => void;
}

export const DEFAULT_VIDEO_FORMAT = 'HEVC';
export const DEFAULT_VIDEO_BIT_DEPTH = 10;
export const DEFAULT_VIDEO_KILOBIT_RATE = 2000;
const newStream = {
  audio_format: 'ADTS',
  audio_kilobit_rate: 128,
  format: 'MPEG-TS-SRT',
  local_ip: '0.0.0.0',
  local_port: 1234,
  remote_ip: '0.0.0.0',
  remote_port: 1234,
  srt_latency_ms: 120,
  srt_mode: 'listener',
  srt_passphrase: '',
  video_bit_depth: DEFAULT_VIDEO_BIT_DEPTH,
  video_format: DEFAULT_VIDEO_FORMAT,
  video_gop_length: 50,
  video_kilobit_rate: DEFAULT_VIDEO_KILOBIT_RATE
};

const PipelineOutputConfig: React.FC<PipelineOutputConfigProps> = (props) => {
  const { title, outputs, pipelineOutputs, updatePipelineOutputs } = props;
  const [updatedOutputs, setUpdatedOutputs] =
    useState<PipelineOutput[]>(pipelineOutputs);
  const t = useTranslate();

  useEffect(() => {
    updatePipelineOutputs(updatedOutputs);
  }, [updatedOutputs]);

  const handleAddStream = (outputId: string) => {
    const newOutputs: PipelineOutput[] = cloneDeep(updatedOutputs);
    const foundOutput = newOutputs.find((o) => o.uuid === outputId);
    if (foundOutput) {
      foundOutput?.streams.push(newStream);
    } else {
      newOutputs.push({
        uuid: outputId,
        settings: {
          video_format: DEFAULT_VIDEO_FORMAT,
          video_bit_depth: DEFAULT_VIDEO_BIT_DEPTH,
          video_kilobit_rate: DEFAULT_VIDEO_KILOBIT_RATE
        },
        streams: [newStream]
      });
    }
    setUpdatedOutputs(newOutputs);
  };

  const handleUpdateStream = (
    outputId: string,
    index: number,
    field: string,
    value: string
  ) => {
    const foundOutputIndex = updatedOutputs.findIndex(
      (o) => o.uuid === outputId
    );
    if (foundOutputIndex >= 0) {
      const getInt = (val: string) => {
        if (Number.isNaN(parseInt(value))) {
          return 0;
        }
        return parseInt(val);
      };
      const newOutputs: PipelineOutput[] = cloneDeep(updatedOutputs);
      const newStream = newOutputs[foundOutputIndex].streams[index];
      switch (field) {
        default:
        case 'port':
          newStream.local_port = getInt(value);
          break;
        case 'srtMode':
          newStream.srt_mode = value;
          break;
        case 'ip':
          newStream.local_ip = value;
          break;
        case 'srtPassphrase':
          newStream.srt_passphrase = value;
          break;
      }
      setUpdatedOutputs(newOutputs);
    }
  };

  const handleDeleteStream = (outputId: string, index: number) => {
    const foundOutputIndex = updatedOutputs.findIndex(
      (o) => o.uuid === outputId
    );
    if (foundOutputIndex >= 0) {
      const newOutputs = cloneDeep(updatedOutputs);
      newOutputs[foundOutputIndex].streams.splice(index, 1);
      setUpdatedOutputs(newOutputs);
    }
  };

  const getOutputStreams = (outputId: string) => {
    const outputStreams =
      updatedOutputs.find((o) => o.uuid === outputId)?.streams || [];
    if (!outputStreams.length) return;

    const convertStream = (
      stream: PipelineOutputSettings,
      index: number
    ): OutputStream => {
      return {
        name: `Stream ${index + 1}`,
        id: '',
        pipelineIndex: 0,
        ip: stream.local_ip,
        srtMode: stream.srt_mode,
        srtPassphrase: stream.srt_passphrase,
        port: stream.local_port,
        videoFormat: stream.video_format,
        videoBit: stream.video_bit_depth,
        videoKiloBit: stream.video_kilobit_rate
      };
    };
    return outputStreams.map((stream, index) => {
      return (
        <StreamAccordion
          isOnlyStream={false}
          key={'output-streams-' + index}
          stream={convertStream(stream, index)}
          update={(field, value) =>
            handleUpdateStream(outputId, index, field, value)
          }
          onDelete={() => handleDeleteStream(outputId, index)}
        />
      );
    });
  };

  const preventCharachters = (evt: KeyboardEvent) => {
    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault();
  };

  const handleUpdateOutputSetting = (
    key: keyof PipelineOutputEncoderSettings,
    value: string | number,
    outputId: string
  ) => {
    const newOutputs: PipelineOutput[] = cloneDeep(updatedOutputs);
    let foundOutputIndex = newOutputs.findIndex((o) => o.uuid === outputId);
    if (foundOutputIndex < 0) {
      newOutputs.push({
        uuid: outputId,
        settings: {
          video_format: DEFAULT_VIDEO_FORMAT,
          video_bit_depth: DEFAULT_VIDEO_BIT_DEPTH,
          video_kilobit_rate: DEFAULT_VIDEO_KILOBIT_RATE
        },
        streams: []
      });
      foundOutputIndex = newOutputs.findIndex((o) => o.uuid === outputId);
    }

    if (!newOutputs[foundOutputIndex].settings) {
      newOutputs[foundOutputIndex].settings = {
        video_format: DEFAULT_VIDEO_FORMAT,
        video_bit_depth: DEFAULT_VIDEO_BIT_DEPTH,
        video_kilobit_rate: DEFAULT_VIDEO_KILOBIT_RATE
      };
    }
    newOutputs[foundOutputIndex].settings[key] = value as never;
    setUpdatedOutputs(newOutputs);
  };

  const getOutputFields = (outputId: string) => {
    const foundOutput = updatedOutputs.find((p) => p.uuid === outputId);

    return (
      <div className="flex flex-col gap-3" key={`${outputId}-options`}>
        <Options
          label={t('preset.video_format')}
          options={['AVC', 'HEVC']}
          value={foundOutput?.settings?.video_format || DEFAULT_VIDEO_FORMAT}
          update={(value) =>
            handleUpdateOutputSetting('video_format', value, outputId)
          }
        />
        <Options
          options={['8', '10']}
          label={t('preset.video_bit_depth')}
          value={
            foundOutput?.settings?.video_bit_depth.toString() ||
            DEFAULT_VIDEO_BIT_DEPTH.toString()
          }
          update={(value) =>
            handleUpdateOutputSetting('video_bit_depth', value, outputId)
          }
        />

        <Input
          onKeyDown={preventCharachters}
          type="number"
          label={t('preset.video_kilobit_rate')}
          value={
            foundOutput?.settings?.video_kilobit_rate ||
            DEFAULT_VIDEO_KILOBIT_RATE
          }
          update={(value) =>
            handleUpdateOutputSetting('video_kilobit_rate', value, outputId)
          }
        />
      </div>
    );
  };

  return (
    <div className="min-h-[30vh]">
      <h1 className="flex justify-center text-2xl">{title}</h1>
      <div className="flex flex-row">
        {outputs?.map((output, index) => (
          <div
            className="flex flex-col gap-2 rounded p-4"
            key={'output-settings-' + index}
          >
            <h1 className="font-bold text-center">{output.name}</h1>
            {getOutputFields(output.uuid)}
            <div className="flex flex-col gap-3">
              {getOutputStreams(output.uuid)}
            </div>
            <button
              onClick={() => handleAddStream(output.uuid)}
              className="rounded-xl p-1 border border-gray-600 focus:border-gray-400 focus:outline-none hover:border-gray-500 p-3"
            >
              {t('preset.add_stream')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineOutputConfig;
