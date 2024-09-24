import { useEffect, useMemo, useState } from 'react';
import { usePipelines } from '../../../hooks/pipelines';
import { Modal } from '../Modal';
import { useTranslate } from '../../../i18n/useTranslate';
import { Preset } from '../../../interfaces/preset';
import Decision from './Decision';
import { PipelineOutputSettings } from '../../../interfaces/pipeline';
import StreamAccordion from './StreamAccordion';
import { OutputStream } from './ConfigureOutputModal';
import { v4 as uuidv4 } from 'uuid';
import Input from './Input';

interface PipelineOutputsModalProps {
  name: string;
  preset: Preset;
  updatePreset: (preset: Preset) => void;
  closeModal: () => void;
}

const PipelineOutputsModal: React.FC<PipelineOutputsModalProps> = (props) => {
  const { name, preset, updatePreset, closeModal } = props;
  const t = useTranslate();
  const [updatedOutputs, setUpdatedOutputs] = useState<
    {
      uuid: string;
      streams: PipelineOutputSettings[];
    }[]
  >([]);

  const [pipes] = usePipelines();

  const outputs = useMemo(() => {
    if (!pipes) return;
    const foundPipeline = pipes.find((p) => p.name === name);
    return foundPipeline?.outputs;
  }, [pipes]);

  useEffect(() => {
    setUpdatedOutputs(
      preset.pipelines.find((p) => p.pipeline_name === name)?.outputs || []
    );
  }, []);

  const onSave = () => {
    const foundPipelineIndex = preset.pipelines.findIndex((p) => {
      return p.pipeline_name === name;
    });
    if (foundPipelineIndex >= 0) {
      const updatedPreset: Preset = preset;
      updatedPreset.pipelines[foundPipelineIndex].outputs = updatedOutputs;
      updatePreset(updatedPreset);
      closeModal();
    }
  };

  const handleAddStream = (outputId: string) => {
    const newOutputs = updatedOutputs;
    const foundOutput = newOutputs.find((o) => o.uuid === outputId);
    const newStream = {
      audio_format: 'sds',
      audio_kilobit_rate: 3434,
      format: 'dsd',
      local_ip: 'dsd',
      local_port: 23232,
      remote_ip: 'sds',
      remote_port: 2323,
      srt_latency_ms: 2323,
      srt_mode: 'sds',
      srt_passphrase: 'dsd',
      video_bit_depth: 232323,
      video_format: 'sdsds',
      video_gop_length: 23,
      video_kilobit_rate: 3434
    };
    if (foundOutput) {
      foundOutput?.streams.push(newStream);
    } else {
      updatedOutputs.push({
        uuid: outputId,
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

      const newOutputs = updatedOutputs.slice();
      const stream = newOutputs[foundOutputIndex].streams[index];
      switch (field) {
        default:
        case 'port':
          stream.local_port = getInt(value);
          break;
        case 'srtMode':
          stream.srt_mode = value;
          break;
        case 'ip':
          stream.local_ip = value;
          break;
        case 'srtPassphrase':
          stream.srt_passphrase = value;
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
      const newOutputs = updatedOutputs;
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
        id: uuidv4(),
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
          update={(field, value, id) =>
            handleUpdateStream(outputId, index, field, value)
          }
          onDelete={() => handleDeleteStream(outputId, index)}
        />
      );
    });
  };

  return (
    <Modal open={true} outsideClick={closeModal}>
      <div className="min-h-[50vh]">
        <h1 className="flex justify-center text-2xl">{name}</h1>
        <div className="flex flex-row">
          {outputs?.map((output, index) => (
            <div
              className="flex flex-col gap-2 rounded p-4"
              key={'output' + index}
            >
              <h1 className="font-bold text-center">{output.name}</h1>
              <div className="flex flex-col gap-3">
                <Input
                  label="Height"
                  value={1080}
                  update={() => console.log('Height')}
                />
                <Input
                  label="Width"
                  value={1920}
                  update={() => console.log('Height')}
                />
              </div>
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
      <Decision onClose={closeModal} onSave={onSave} />
    </Modal>
  );
};

export default PipelineOutputsModal;
