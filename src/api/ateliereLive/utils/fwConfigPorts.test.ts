import { getPipelines } from '../pipelines/pipelines';
import {
  getAvailablePortsForIngest,
  getCurrentlyUsedPorts,
  initDedicatedPorts
} from './fwConfigPorts';

let pipelineIds: string[];
let usedPorts: Set<number>;

beforeAll(async () => {
  const pipelines = await getPipelines();
  pipelineIds = pipelines.map((pipe) => {
    if (pipe.uuid !== undefined) {
      return pipe.uuid;
    }
  }) as string[];
  initDedicatedPorts();
});

beforeEach(async () => {
  usedPorts = await getCurrentlyUsedPorts(pipelineIds);
});

describe.skip('fwConfigPorts tests', () => {
  describe('getCurrentlyUsedPorts', () => {
    test('should return currently used ports', async () => {
      usedPorts.clear();
      usedPorts = await getCurrentlyUsedPorts(pipelineIds);

      expect(usedPorts).not.toBeUndefined();
      expect(usedPorts.size).toBeGreaterThan(0);
    });
  });

  describe('getAvailableTypePorts', () => {
    test('should return available ingest ports', async () => {
      const ingestPorts = getAvailablePortsForIngest('cloud_ingest', usedPorts);

      expect(ingestPorts).not.toBeUndefined();
      expect(ingestPorts.size).toBeGreaterThan(0);
    });

    test('should return default ingest ports when ingest doesnt exist', async () => {
      const ingestPorts = getAvailablePortsForIngest('wrong_name', usedPorts);

      expect(ingestPorts).not.toBeUndefined();
      expect(ingestPorts.size).toBeGreaterThan(0);
    });
  });
});
