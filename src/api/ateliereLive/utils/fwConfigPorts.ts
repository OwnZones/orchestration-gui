import {
  FwConfigTypeEnum,
  FwConfigWithId
} from '../../../interfaces/firewallConfig';
import {
  getFwConfigs,
  putFwConfigLastUsedPortIndex
} from '../../manager/firewallConfig';
import { getPipeline } from '../pipelines/pipelines';

const dedicatedPorts = new Map<string, FwConfigWithId>();

export async function initDedicatedPorts() {
  dedicatedPorts.clear();
  (await getFwConfigs()).map((conf) => {
    dedicatedPorts.set(`${conf.type}-${conf.name}`, conf);
  });
}

export async function getCurrentlyUsedPorts(
  pipelineIds: string[]
): Promise<Set<number>> {
  const usedPorts = new Set<number>();
  for (const id of pipelineIds) {
    const pipeline = await getPipeline(id);
    if (pipeline.outputs) {
      pipeline.outputs.forEach((output) => {
        output.active_streams?.forEach((outputStream) => {
          if (outputStream.mpeg_ts_srt?.local_port) {
            usedPorts.add(outputStream.mpeg_ts_srt.local_port);
          }
        });
      });
    }

    if (pipeline.streams) {
      pipeline.streams.forEach((stream) => {
        if (stream.interfaces) {
          stream.interfaces?.forEach((i) => {
            if (i.port) usedPorts.add(i.port);
          });
        }
      });
    }

    if (pipeline.multiviews) {
      pipeline.multiviews.forEach((mw) => {
        if (mw.output?.mpeg_ts_srt?.local_port)
          usedPorts.add(mw.output.mpeg_ts_srt.local_port);
      });

      if (pipeline.control_receiver.listening_interface) {
        usedPorts.add(pipeline.control_receiver.listening_interface.port);
      }
    }
  }

  return usedPorts;
}

export async function getNextAvailablePortForIngest(
  name: string,
  usedPorts: Set<number>
) {
  let dedicatedPortsForName = dedicatedPorts.get(
    `${FwConfigTypeEnum.Ingest}-${name}`
  )!;
  if (!dedicatedPortsForName) {
    dedicatedPortsForName = dedicatedPorts.get(
      `${FwConfigTypeEnum.Ingest}-${'default'}`
    )!;
  }

  const port_range = dedicatedPortsForName.port_range_allow;
  const numberOfPorts = port_range.length;
  let availablePort = -1;
  for (let i = 0; i < numberOfPorts; i++) {
    const currentPort =
      port_range[dedicatedPortsForName.last_used_port_index++ % numberOfPorts];
    if (usedPorts && !usedPorts.has(currentPort)) {
      availablePort = currentPort;
      break;
    }
  }

  if (availablePort != -1) {
    dedicatedPortsForName.last_used_port_index %= numberOfPorts;
    await putFwConfigLastUsedPortIndex(dedicatedPortsForName);
  }

  return availablePort;
}
