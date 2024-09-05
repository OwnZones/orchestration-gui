'use client';

import { useEffect, useRef, useState } from 'react';
import { ResourcesCompactPipelineResponse } from '../../../types/ateliere-live';
import { usePipeline } from '../../hooks/pipelines';
import { WebRTCPlayer } from '@eyevinn/webrtc-player';
import { Loader } from '../loader/Loader';

type MultiviewProps = {
  pipeline: ResourcesCompactPipelineResponse;
  multiviewId: number;
};

export function Multiview({ pipeline: { uuid }, multiviewId }: MultiviewProps) {
  const [data, loading, error, refresh] = usePipeline(uuid!);
  const videoReference = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState<WebRTCPlayer | undefined>(undefined);

  const multiview = data?.status.whepMultiviews.find(
    (m) => m.id == multiviewId
  );
  const whepUrl = multiview?.whepUrl;

  useEffect(() => {
    if (whepUrl && !player) {
      const player = new WebRTCPlayer({
        video: videoReference.current!,
        type: 'whep',
        debug: true
      });
      player
        .load(new URL(whepUrl))
        .then(() => {
          console.log('loaded', whepUrl);
          setPlayer(player);
        })
        .catch((e) => console.error(e));
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(undefined);
      }
    };
  }, [whepUrl]);

  return (
    <div className="w-full max-h-[100%] bg-container rounded break-all overflow-auto">
      {loading && <Loader className="w-10 h-5" />}
      {!loading ? (
        <video
          ref={videoReference}
          autoPlay={true}
          muted={true}
          playsInline={true}
        ></video>
      ) : null}
    </div>
  );
}
