import { Preset } from '../../../interfaces/preset';
import { ProgramOutput, PipelineSettings } from '../../../interfaces/pipeline';
import { Modal } from '../Modal';
import Decision from './Decision';
import { useEffect, useState } from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { MultiviewSettings } from '../../../interfaces/multiview';
import MultiviewSettingsConfig from './MultiviewSettings';
import PipelineSettingsConfig from './PipelineSettings';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export interface OutputStream {
  name: string;
  id: string;
  pipelineIndex: number;
  ip: string;
  srtMode: string;
  srtPassphrase: string;
  port: number;
  videoFormat: string;
  videoBit: number;
  videoKiloBit: number;
}

type ConfigureOutputModalProps = {
  open: boolean;
  preset: Preset;
  onClose: () => void;
  updatePreset: (preset: Preset) => void;
};

export function ConfigureOutputModal({
  open,
  preset,
  onClose,
  updatePreset
}: ConfigureOutputModalProps) {
  const defaultState = (pipelines: PipelineSettings[]) => {
    const streamsPerPipe = pipelines.map((pipe, i) => {
      return pipe.program_output.map((output) => ({
        name: ``,
        id: uuidv4(),
        pipelineIndex: i,
        ip:
          output?.srt_mode === 'listener'
            ? output.local_ip
            : output?.remote_ip || '0.0.0.0',
        srtMode: output?.srt_mode,
        srtPassphrase: output?.srt_passphrase || '',
        port: output?.port,
        videoFormat: output?.video_format,
        videoBit: output?.video_bit_depth,
        videoKiloBit: output?.video_kilobit_rate
      }));
    });

    return streamsPerPipe.flatMap((streams) => {
      return streams.map((stream, i) => {
        return { ...stream, name: `Stream ${i + 1}` };
      });
    }) satisfies OutputStream[];
  };

  const [outputstreams, setOutputStreams] = useState<OutputStream[]>(
    defaultState(preset.pipelines)
  );
  const [multiviews, setMultiviews] = useState<MultiviewSettings[]>([]);
  const [portDuplicateIndexes, setPortDuplicateIndexes] = useState<number[]>(
    []
  );
  const t = useTranslate();

  useEffect(() => {
    if (preset.pipelines[0].multiviews) {
      if (!Array.isArray(preset.pipelines[0].multiviews)) {
        setMultiviews([preset.pipelines[0].multiviews]);
      } else {
        setMultiviews(preset.pipelines[0].multiviews);
      }
    }
  }, [preset.pipelines]);

  useEffect(() => {
    setOutputStreams(defaultState(preset.pipelines));
  }, [preset]);

  const clearInputs = () => {
    setMultiviews(preset.pipelines[0].multiviews || []);
    setOutputStreams(defaultState(preset.pipelines));
    // onClose();
  };

  useEffect(() => {
    runDuplicateCheck(multiviews);
  }, [multiviews]);

  const onSave = () => {
    const presetToUpdate = {
      ...preset,
      pipelines: preset.pipelines.map((pipeline, i) => {
        return {
          ...pipeline,
          program_output: streamsToProgramOutputs(
            i,
            outputstreams.filter((o) => o.pipelineIndex === i)
          )
        };
      })
    };

    if (!multiviews) {
      toast.error(t('preset.no_multiview_selected'));
      return;
    }

    if (portDuplicateIndexes.length > 0) {
      toast.error(t('preset.no_port_selected'));
      return;
    }

    presetToUpdate.pipelines[0].multiviews = multiviews.map(
      (singleMultiview) => {
        return { ...singleMultiview };
      }
    );

    updatePreset(presetToUpdate);
    onClose();
  };

  const streamsToProgramOutputs = (
    pipelineIndex: number,
    outputStreams?: OutputStream[]
  ) => {
    if (!outputStreams) return [];
    return outputStreams.map((stream) => ({
      ...preset.pipelines[pipelineIndex].program_output[0],
      port: stream.port,
      [stream.srtMode === 'listener' ? 'local_ip' : 'remote_ip']: stream.ip,
      srt_mode: stream.srtMode,
      video_bit_depth: stream.videoBit,
      video_format: stream.videoFormat,
      video_kilobit_rate: stream.videoKiloBit,
      srt_passphrase: stream.srtPassphrase
    })) satisfies ProgramOutput[];
  };

  const addStream = (stream: OutputStream) => {
    const streams = outputstreams.filter(
      (o) => o.pipelineIndex === stream.pipelineIndex
    );
    if (streams.length > 4) return;
    setOutputStreams([
      ...outputstreams,
      {
        ...stream,
        name: `${t('preset.stream_name')} ${streams.length + 1}`,
        port: streams[streams.length - 1].port + 1
      }
    ]);
  };

  const updateStream = (updatedStream: OutputStream) => {
    setOutputStreams(
      [
        ...outputstreams.filter((o) => o.id !== updatedStream.id),
        updatedStream
      ].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const updateStreams = (updatedStreams: OutputStream[]) => {
    const streams = outputstreams.filter(
      (o) => !updatedStreams.some((u) => u.id === o.id)
    );
    setOutputStreams(
      [...streams, ...updatedStreams].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
  };

  const setNames = (outputstreams: OutputStream[], index: number) => {
    const streamsForPipe = outputstreams.filter(
      (o) => o.pipelineIndex === index
    );
    const rest = outputstreams.filter((o) => o.pipelineIndex !== index);
    return [
      ...streamsForPipe.map((s, i) => ({ ...s, name: `Stream ${i + 1}` })),
      ...rest
    ];
  };

  const deleteStream = (id: string, index: number) => {
    setOutputStreams(
      setNames(
        outputstreams.filter((o) => o.id !== id),
        index
      )
    );
  };

  const findDuplicateValues = (mvs: MultiviewSettings[]) => {
    const ports = mvs.map(
      (item: MultiviewSettings) =>
        item.output.local_ip + ':' + item.output.local_port.toString()
    );
    const duplicateIndices: number[] = [];
    const seenPorts = new Set();

    ports.forEach((port, index) => {
      if (seenPorts.has(port)) {
        duplicateIndices.push(index);
        // Also include the first occurrence if it's not already included
        const firstIndex = ports.indexOf(port);
        if (!duplicateIndices.includes(firstIndex)) {
          duplicateIndices.push(firstIndex);
        }
      } else {
        seenPorts.add(port);
      }
    });

    return duplicateIndices;
  };

  const runDuplicateCheck = (mvs: MultiviewSettings[]) => {
    const hasDuplicates = findDuplicateValues(mvs);

    if (hasDuplicates.length > 0) {
      setPortDuplicateIndexes(hasDuplicates);
    }

    if (hasDuplicates.length === 0) {
      setPortDuplicateIndexes([]);
    }
  };

  const handleUpdateMultiview = (
    multiview: MultiviewSettings,
    index: number
  ) => {
    const updatedMultiviews = multiviews.map((item, i) =>
      i === index ? { ...item, ...multiview } : item
    );

    runDuplicateCheck(multiviews);

    setMultiviews(updatedMultiviews);
  };

  const addNewMultiview = (newMultiview: MultiviewSettings) => {
    setMultiviews((prevMultiviews) =>
      prevMultiviews ? [...prevMultiviews, newMultiview] : [newMultiview]
    );
  };

  const removeNewMultiview = (index: number) => {
    const newMultiviews = multiviews.filter((_, i) => i !== index);
    setMultiviews(newMultiviews);
  };

  return (
    <Modal
      open={open}
      outsideClick={() => {
        clearInputs();
      }}
    >
      <div className="flex gap-3">
        {preset.pipelines.map((pipeline, i) => {
          return (
            <PipelineSettingsConfig
              key={pipeline.pipeline_readable_name}
              title={`${
                pipeline.pipeline_name
                  ? pipeline.pipeline_name
                  : pipeline.pipeline_readable_name
              }`}
              streams={outputstreams.filter((o) => o.pipelineIndex === i)}
              addStream={addStream}
              updateStream={updateStream}
              updateStreams={updateStreams}
              deleteStream={deleteStream}
              updatePreset={updatePreset}
              preset={preset}
            />
          );
        })}
        {multiviews &&
          multiviews.length > 0 &&
          multiviews.map((singleItem, index) => {
            return (
              <div className="flex" key={index}>
                <div className="min-h-full border-l border-separate opacity-10 my-12"></div>
                <div className="flex flex-col">
                  <MultiviewSettingsConfig
                    multiview={singleItem}
                    handleUpdateMultiview={(input) =>
                      handleUpdateMultiview(input, index)
                    }
                    portDuplicateError={
                      portDuplicateIndexes.length > 0
                        ? portDuplicateIndexes.includes(index)
                        : false
                    }
                  />
                  <div
                    className={`w-full flex ${
                      multiviews.length > 1 ? 'justify-between' : 'justify-end'
                    }`}
                  >
                    {multiviews.length > 1 && (
                      <button
                        type="button"
                        title="Add another multiview"
                        onClick={() => removeNewMultiview(index)}
                      >
                        <IconTrash
                          className={`ml-4 text-button-delete hover:text-red-400`}
                        />
                      </button>
                    )}
                    {multiviews.length === index + 1 && (
                      <button
                        type="button"
                        title="Add another multiview"
                        onClick={() => addNewMultiview(singleItem)}
                      >
                        <IconPlus className="mr-2 text-green-400 hover:text-green-200" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <Decision onClose={() => clearInputs()} onSave={onSave} />
    </Modal>
  );
}
