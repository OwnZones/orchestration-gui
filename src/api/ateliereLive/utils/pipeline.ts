import { ResourcesPipelineResponse } from '../../../../types/ateliere-live';

export function isActive(pipeline: ResourcesPipelineResponse) {
  return !!pipeline.streams?.length;
}
