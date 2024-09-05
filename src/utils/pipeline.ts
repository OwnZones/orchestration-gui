'server-only';

import {
  ResourcesPipelineResponse,
  ResourcesOutputActiveStreamMpegTsSrt
} from '../../types/ateliere-live';
import { SrtOutput } from '../interfaces/pipeline';
import { WhepMultiview } from '../interfaces/whep';
import { getWhepUrlForSRT } from './whep';

function getSRTOutput(
  stream: ResourcesOutputActiveStreamMpegTsSrt,
  publicIp: string
) {
  if (stream.srt_mode === 'caller') {
    return {
      srt_mode: 'caller',
      ip: stream.remote_ip,
      port: stream.remote_port,
      url: `srt://${stream.remote_ip}:${stream.remote_port}`
    };
  }
  if (!stream.local_port) {
    return;
  }
  return {
    srt_mode: 'listener',
    ip: publicIp,
    port: stream.local_port,
    url: `srt://${publicIp}:${stream.local_port}`
  };
}

export function getSRTMultiviews(
  pipeline: ResourcesPipelineResponse
): SrtOutput[] {
  return pipeline.multiviews?.flatMap((multiview) => {
    const stream = multiview?.output?.mpeg_ts_srt;
    if (stream) {
      const output = getSRTOutput(stream, pipeline.public_ip);
      if (output) return output;
    }
    return [];
  });
}

export function getSRTOutputs(
  pipeline: ResourcesPipelineResponse
): SrtOutput[] {
  return pipeline.outputs?.flatMap((output) => {
    if (output.active_streams) {
      return output.active_streams.flatMap((s) => {
        if (s.mpeg_ts_srt) {
          const output = getSRTOutput(s.mpeg_ts_srt, pipeline.public_ip);
          if (output) return output;
        }
        return [];
      });
    }
    return [];
  });
}

export function getWhepMultiviews(
  pipeline: ResourcesPipelineResponse
): WhepMultiview[] {
  return (
    pipeline.multiviews
      ?.map((multiview) => {
        const stream = multiview?.output?.mpeg_ts_srt;
        const srt = stream
          ? getSRTOutput(stream, pipeline.public_ip)
          : undefined;
        if (srt) {
          return {
            id: multiview?.id,
            pipelineName: pipeline.name,
            whepUrl: getWhepUrlForSRT(srt.url)?.toString()
          };
        }
      })
      .filter((whep): whep is WhepMultiview => !!whep) || []
  );
}
