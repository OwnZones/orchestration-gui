import { FwConfigTypeEnum } from '../../../interfaces/firewallConfig';
import { getFwConfigs } from '../../manager/firewallConfig';
import { getPipeline } from '../pipelines/pipelines';

const dedicatedPorts = new Map<string, Set<number>>();

export async function initDedicatedPorts() {
  dedicatedPorts.clear();
  (await getFwConfigs()).map((conf) => {
    const temp = dedicatedPorts.get(`${conf.type}-${conf.name}`);
    if (temp) {
      conf.port_range_allow.forEach((port) => {
        temp.add(port);
      });
      dedicatedPorts.set(`${conf.type}-${conf.name}`, temp);
    } else {
      dedicatedPorts.set(
        `${conf.type}-${conf.name}`,
        new Set<number>(conf.port_range_allow)
      );
    }
  });
  const temp = dedicatedPorts;
  return temp;
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

export function getAvailablePortsForIngest(
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
  const availablePorts = new Set<number>();
  dedicatedPortsForName.forEach((dedPort) => {
    if (usedPorts && !usedPorts.has(dedPort)) {
      availablePorts.add(dedPort);
    }
  });
  return availablePorts;
}

export function getAvailablePortsForNameAndType(
  name: string,
  type: string,
  usedPorts: Set<number>
) {
  const dedicatedTypePorts = dedicatedPorts.get(`${type}-${name}`)!;
  const availablePorts = new Set<number>();
  dedicatedTypePorts.forEach((dedPort) => {
    if (usedPorts && !usedPorts.has(dedPort)) {
      availablePorts.add(dedPort);
    }
  });
  return availablePorts;
}
