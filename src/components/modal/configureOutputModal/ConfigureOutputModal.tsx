import { Preset } from '../../../interfaces/preset';
import { Modal } from '../Modal';
import Decision from './Decision';
import PipelineOutputConfig from './PipelineOutputConfig';
import { useState } from 'react';
import { PipelineOutput, PipelineSettings } from '../../../interfaces/pipeline';
import { usePipelines } from '../../../hooks/pipelines';

type ConfigureOutputModalProps = {
  open: boolean;
  preset: Preset;
  onClose: () => void;
  updatePreset: (preset: Preset) => void;
};

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

export function ConfigureOutputModal({
  open,
  preset,
  onClose,
  updatePreset
}: ConfigureOutputModalProps) {
  const [pipelines, setPipelines] = useState<PipelineSettings[]>(
    preset.pipelines || []
  );

  const [pipes] = usePipelines();

  const onSave = () => {
    updatePreset({ ...preset, pipelines: pipelines });
    onClose();
  };

  const updatePipelineOutputFunc = (
    pipeline: PipelineSettings,
    outputs: PipelineOutput[]
  ) => {
    const pipelineIndex = pipelines.findIndex(
      (p) => p.pipeline_name === pipeline.pipeline_name
    );
    if (pipelineIndex >= 0) {
      const newPipelines = pipelines.slice();
      newPipelines.splice(pipelineIndex, 1, { ...pipeline, outputs: outputs });
      setPipelines(newPipelines);
    }
  };

  return (
    <Modal
      open={open}
      outsideClick={() => {
        onClose();
      }}
    >
      <div className="flex gap-3 flex-col text-center">
        {pipelines.map((pipeline, i) => {
          return (
            <PipelineOutputConfig
              key={pipeline.pipeline_readable_name + i}
              title={pipeline.pipeline_name || ''}
              outputs={
                pipes?.find((p) => p.name === pipeline.pipeline_name)
                  ?.outputs || []
              }
              pipelineOutputs={pipeline.outputs || []}
              updatePipelineOutputs={(outputs: PipelineOutput[]) =>
                updatePipelineOutputFunc(pipeline, outputs)
              }
            />
          );
        })}
      </div>
      <Decision onClose={() => onClose()} onSave={onSave} />
    </Modal>
  );
}
