'use client';

import RunningIndication from './RunningIndication';
import { Loader } from '../loader/Loader';
import { usePipeline } from '../../hooks/pipelines';
import CopyToClipboard from '../copyToClipboard/CopyToClipboard';
import { useEffect } from 'react';

type PipelineCardProps = {
  pipelineId: string;
  isActive: boolean;
};

export function PipelineCard({ pipelineId, isActive }: PipelineCardProps) {
  const [data, loadingPipeline, error, refresh] = usePipeline(pipelineId);
  useEffect(() => {
    refresh();
  }, [isActive]);

  const SrtInfo = data?.status;

  useEffect(() => {
    console.log('SrtInfo', SrtInfo);
  }, [SrtInfo]);

  if (SrtInfo === undefined) {
    return null;
  }

  const multiviews = SrtInfo?.multiviews
    .map((srt) => ({
      isMulti: true,
      value: srt,
      viewer: SrtInfo?.whepMultiviews[0]
    }))
    .sort((a, b) => (a.value.port < b.value.port ? -1 : 1));

  const outputs = SrtInfo?.outputs.map((srt) => ({
    value: srt
  }));

  const allStreams = [...multiviews, ...outputs].filter(({ value }) => value);
  return (
    <div className="bg-container rounded p-4 flex gap-2 items-center">
      {loadingPipeline && <Loader className="w-10 h-5" />}
      {!loadingPipeline && data && (
        <>
          <RunningIndication running={!!data.status.active} />
          <h2 className="text-p">{data.pipeline.name}</h2>
          {allStreams.length ? (
            <CopyToClipboard allSrtUrls={allStreams} />
          ) : null}
        </>
      )}
    </div>
  );
}
