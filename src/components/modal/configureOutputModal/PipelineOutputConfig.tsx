import { useEffect, useState, KeyboardEvent } from 'react';
import { ResourcesNameAndUUIDResponse } from '../../../../types/ateliere-live';
import { useTranslate } from '../../../i18n/useTranslate';
import Input from './Input';
import {
  PipelineOutput,
  PipelineOutputEncoderSettings,
  PipelineOutputSettings,
  PipelineSettings
} from '../../../interfaces/pipeline';
import StreamAccordion from './StreamAccordion';
import { OutputStream } from './ConfigureOutputModal';
import Options from './Options';
import cloneDeep from 'lodash.clonedeep';

export type PipelineTypes = 'LD' | 'HQ';

interface PipelineOutputConfigProps {
  title: string;
  outputs: ResourcesNameAndUUIDResponse[];
  pipelineOutputs: PipelineOutput[];
  updatePipelineOutputs: (outputs: PipelineOutput[]) => void;
  getPortNumber: () => number;
  pipeline: PipelineSettings;
}

const getStreamEncoderSettings = (pipeline: PipelineSettings) => {
  return {
    video_bit_depth: pipeline.bit_depth,
    video_format: pipeline.format,
    video_kilobit_rate: pipeline.video_kilobit_rate
  };
};

const createNewStream = (portNumber: number, pipeline: PipelineSettings) => {
  return {
    audio_format: 'ADTS',
    audio_kilobit_rate: 128,
    format: 'MPEG-TS-SRT',
    local_ip: '0.0.0.0',
    local_port: portNumber,
    remote_ip: '0.0.0.0',
    remote_port: portNumber,
    srt_latency_ms: 120,
    srt_mode: 'listener',
    srt_passphrase: '',
    video_gop_length: 50,
    srt_stream_id: '',
    ...getStreamEncoderSettings(pipeline)
  };
};

const PipelineOutputConfig: React.FC<PipelineOutputConfigProps> = (props) => {
  const {
    title,
    outputs,
    pipelineOutputs,
    updatePipelineOutputs,
    pipeline,
    getPortNumber
  } = props;
  const [updatedOutputs, setUpdatedOutputs] =
    useState<PipelineOutput[]>(pipelineOutputs);
  const t = useTranslate();

  useEffect(() => {
    updatePipelineOutputs(updatedOutputs);
  }, [updatedOutputs]);

  const handleAddStream = (output: ResourcesNameAndUUIDResponse) => {
    const newOutputs: PipelineOutput[] = cloneDeep(updatedOutputs);
    const foundOutput = newOutputs.find((o) => o.uuid === output.uuid);
    const newStream = createNewStream(getPortNumber(), pipeline);
    if (foundOutput) {
      foundOutput?.streams.push(newStream);
    } else {
      newOutputs.push({
        uuid: output.uuid,
        name: output.name,
        settings: getStreamEncoderSettings(pipeline),
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
          newStream.remote_port = getInt(value);
          break;
        case 'srtMode':
          newStream.srt_mode = value;
          break;
        case 'ip':
          newStream.local_ip = value;
          newStream.remote_ip = value;
          break;
        case 'srtPassphrase':
          newStream.srt_passphrase = value;
          break;
        case 'srt_stream_id':
          newStream.srt_stream_id = value;
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
        pipelineIndex: 0,
        ip: stream.local_ip,
        srtMode: stream.srt_mode,
        srtPassphrase: stream.srt_passphrase,
        port: stream.local_port,
        videoFormat: stream.video_format,
        videoBit: stream.video_bit_depth,
        videoKiloBit: stream.video_kilobit_rate,
        srt_stream_id: stream.srt_stream_id
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

  const preventCharacters = (evt: KeyboardEvent) => {
    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault();
  };

  const handleUpdateOutputSetting = (
    key: keyof PipelineOutputEncoderSettings,
    value: string | number,
    output: ResourcesNameAndUUIDResponse
  ) => {
    const newOutputs: PipelineOutput[] = cloneDeep(updatedOutputs);
    let foundOutputIndex = newOutputs.findIndex((o) => o.uuid === output.uuid);
    if (foundOutputIndex < 0) {
      newOutputs.push({
        uuid: output.uuid,
        name: output.name,
        settings: getStreamEncoderSettings(pipeline),
        streams: []
      });
      foundOutputIndex = newOutputs.findIndex((o) => o.uuid === output.uuid);
    }

    if (!newOutputs[foundOutputIndex].settings) {
      newOutputs[foundOutputIndex].settings =
        getStreamEncoderSettings(pipeline);
    }

    // Simple workaround to set these values as numbers
    if (['video_bit_depth', 'video_kilobit_rate'].includes(key)) {
      newOutputs[foundOutputIndex].settings[key] = Number(value) as never;
    } else {
      newOutputs[foundOutputIndex].settings[key] = value as never;
    }
    setUpdatedOutputs(newOutputs);
  };

  const getOutputFields = (output: ResourcesNameAndUUIDResponse) => {
    const foundOutput = updatedOutputs.find((p) => p.uuid === output.uuid);

    return (
      <div className="flex flex-col gap-3" key={`${output.uuid}-options`}>
        <Options
          label={t('preset.video_format')}
          options={[
            { id: 'AVC', label: 'AVC' },
            { id: 'HEVC', label: 'HEVC' }
          ]}
          value={
            foundOutput?.settings?.video_format ||
            getStreamEncoderSettings(pipeline).video_format
          }
          update={(value) =>
            handleUpdateOutputSetting('video_format', value, output)
          }
        />
        <Options
          options={[
            {
              id: '8',
              label: '8'
            },
            {
              id: '10',
              label: '10'
            }
          ]}
          label={t('preset.video_bit_depth')}
          value={
            foundOutput?.settings?.video_bit_depth.toString() ||
            getStreamEncoderSettings(pipeline).video_bit_depth.toString()
          }
          update={(value) =>
            handleUpdateOutputSetting('video_bit_depth', value, output)
          }
        />

        <Input
          onKeyDown={preventCharacters}
          type="number"
          label={t('preset.video_kilobit_rate')}
          value={
            foundOutput?.settings?.video_kilobit_rate ||
            getStreamEncoderSettings(pipeline).video_kilobit_rate
          }
          update={(value) =>
            handleUpdateOutputSetting('video_kilobit_rate', value, output)
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
            {getOutputFields(output)}
            <div className="flex flex-col gap-3">
              {getOutputStreams(output.uuid)}
            </div>
            <button
              onClick={() => handleAddStream(output)}
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
