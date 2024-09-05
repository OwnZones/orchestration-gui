import {
  ResourcesCompactPipelineResponse,
  ResourcesPipelineResponse
} from '../../../../types/ateliere-live';
import {
  PipelineOutputSettings,
  PipelineSettings
} from '../../../interfaces/pipeline';
import { getControlPanels } from '../controlpanels';
import { getAuthorizationHeader } from '../utils/authheader';
import { connectSenderAndReceiver } from '../controlconnections';
import { deleteStreamByUuid } from '../streams';
import {
  getPipelineOutputs,
  startPipelineStream,
  stopAllOutputStreamsByUuid
} from './outputs/outputs';
import { getPipelineStreams } from './streams/streams';
import { ControlConnection } from '../../../interfaces/controlConnections';
import { Log } from '../../logger';
import { LIVE_BASE_API_PATH } from '../../../constants';

export async function getPipeline(
  uuid: string
): Promise<ResourcesPipelineResponse> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${uuid}?expand=true`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.json();
}

export async function getPipelineCompact(
  uuid: string
): Promise<ResourcesCompactPipelineResponse> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${uuid}?expand=false`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.json();
}

export async function getPipelines(): Promise<
  ResourcesCompactPipelineResponse[]
> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines?expand=true`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return (await response.json()).map((pipeline: any) => {
      return {
        name: pipeline.name,
        uuid: pipeline.uuid,
        outputs: pipeline.outputs,
        streams: pipeline.streams
      };
    });
  }
  throw await response.json();
}

export async function resetPipeline(pipelineUuid: string): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/reset`,
      process.env.LIVE_URL
    ),
    {
      method: 'PUT',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return;
  }
  throw await response.text();
}

export async function removePipelineStreams(pipeId: string) {
  const outputs = await getPipelineOutputs(pipeId).catch((error) => {
    throw error.message;
  });
  const streams = await getPipelineStreams(pipeId).catch((error) => {
    throw error.message;
  });
  const results = [];
  for (const output of outputs) {
    try {
      if (output.active_streams) {
        Log().info(
          `Stopping output '${pipeId}/${output.uuid}' and ${output.active_streams?.length} active streams`
        );
        const status = await stopAllOutputStreamsByUuid(pipeId, output.uuid!);
        results.push({ status, uuid: output.uuid });
        Log().info(`Output '${pipeId}/${output.uuid}' stopped`);
      }
    } catch (error) {
      Log().error(`Failed to stop output '${pipeId}/${output.uuid}'`, error);
    }
  }
  for (const stream of streams) {
    try {
      Log().info(`Removing stream '${stream.uuid}' from pipeline '${pipeId}'`);
      const status = await deleteStreamByUuid(stream.uuid!);
      results.push({ status, uuid: stream.uuid });
      Log().info(`Stream '${stream.uuid}' from pipeline '${pipeId}' removed`);
    } catch (error) {
      Log().error(
        `Failed to remove stream '${stream.uuid}' from pipeline '${pipeId}'`,
        error
      );
      Log().info(stream);
    }
  }
  return { status: 200, results };
}

export async function createPipelineOutputs(pipeline: PipelineSettings) {
  const outputs = await getPipelineOutputs(pipeline.pipeline_id!).catch(
    (error) => {
      Log().error(
        `Failed to get outputs for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`,
        error
      );
      throw `Failed to get outputs for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}': ${error}`;
    }
  );

  Log().info(
    `Creating outputs for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`
  );

  let outputUuid = outputs[0].uuid!;
  if (outputs.length > 0) {
    const outputToUse = outputs.find(
      (output) => output.name.toLowerCase().indexOf('program') !== -1
    );
    if (outputToUse) {
      outputUuid = outputToUse.uuid!;
    }
  }

  await startPipelineStream(
    pipeline.pipeline_id!,
    outputUuid,
    buildPipelineSettingsBody(pipeline)
  ).catch((error) => {
    Log().error(
      `Failed to create outputs for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}' at output '${outputUuid}'`,
      error
    );
    throw `Failed to create outputs for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}' at output '${outputUuid}': ${error.message}`;
  });
  Log().info(
    `Outputs for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}' created`
  );
}

export async function connectControlPanelToPipeline(
  control_connection: ControlConnection,
  pipelines: PipelineSettings[]
) {
  const controlPanels = await getControlPanels().catch((error) => {
    Log().error(`Failed to get Control Panels`, error);
    throw `Failed to get Control Panels: ${error.message}`;
  });

  const productionControlPanels = controlPanels.filter((c) =>
    control_connection.control_panel_name?.includes(c.name)
  );

  if (!productionControlPanels || productionControlPanels.length === 0) {
    Log().error(
      `Did not find control panel: ${control_connection.control_panel_name}`
    );
    throw `Did not find control panel: ${control_connection.control_panel_name}`;
  }

  const pipelinesIds = pipelines.map((pipeline) => {
    if (!pipeline.pipeline_id) {
      throw `Found pipeline with missing UUID: ${pipeline.pipeline_name}`;
    }
    return pipeline.pipeline_id;
  });

  productionControlPanels.forEach((controlPanel) => {
    if (controlPanel.outgoing_connections.length > 0) {
      Log().error(`Control panel '${controlPanel.name}' is already in use'`);
      throw `Control panel '${controlPanel.name}' is already in use`;
    }
  });

  const pipeline =
    pipelinesIds[control_connection.control_panel_endpoint.toPipelineIdx];

  //
  // Connect control panel(s) to pipeline
  //
  // Currently system controller/pipeline can't handle two simultaneous connections to the same pipeline,
  // so instead we connect one control panel at a time (previous code was similar to the block below where
  // we connect pipeline to pipeline asynchronously.)
  for (const controlPanel of productionControlPanels) {
    Log().info(
      `Connecting control panel '${controlPanel.uuid}' with receiver at pipeline: '${pipeline}' using port ${control_connection.control_panel_endpoint.port}`
    );
    try {
      await connectSenderAndReceiver(
        controlPanel.uuid,
        pipeline,
        0,
        control_connection.control_panel_endpoint.port
      );
    } catch (error) {
      throw `Failed to connect control panel '${controlPanel.uuid}' with receiver at pipeline: '${pipeline}' using port ${control_connection.control_panel_endpoint.port}, error: ${error}`;
    }
  }

  // Connect pipeline to pipeline
  const connectSendersToReceivers =
    control_connection.pipeline_control_connections.map(
      async (controlConnection) => {
        const sender = pipelinesIds[controlConnection.fromPipelineIdx];
        const receiver = pipelinesIds[controlConnection.toPipelineIdx];
        const fromPipeline = pipelines[controlConnection.fromPipelineIdx];
        const toPipeline = pipelines[controlConnection.toPipelineIdx];
        Log().info(
          `Connecting receiver from pipeline '${sender}' with receiver at pipeline '${receiver}' using port ${controlConnection.port}`
        );
        return await connectSenderAndReceiver(
          sender,
          receiver,
          toPipeline.alignment_ms - fromPipeline.alignment_ms,
          controlConnection.port
        ).catch((error) => {
          throw `Failed to connect sender from pipeline '${sender}' with receiver at pipeline '${receiver}' using port ${controlConnection.port}: ${error}`;
        });
      }
    );
  await Promise.all(connectSendersToReceivers);
}

function buildPipelineSettingsBody(
  pipeline: PipelineSettings
): PipelineOutputSettings[] {
  const outputSettings = pipeline.program_output.map((output) => {
    return {
      audio_format: output.audio_format,
      audio_kilobit_rate: output.audio_kilobit_rate,
      format: output.format,
      local_ip: output.local_ip,
      local_port: output.srt_mode === 'caller' ? 0 : output.port,
      remote_ip: output.remote_ip, // only used in caller mode
      remote_port: output.port,
      srt_mode: output.srt_mode, // 'listener' or 'caller'
      srt_latency_ms: output.srt_latency_ms, // 120
      srt_passphrase: output.srt_passphrase, // ''
      video_bit_depth: output.video_bit_depth,
      video_format: output.video_format,
      video_gop_length: output.video_gop_length,
      video_kilobit_rate: output.video_kilobit_rate
    };
  });
  Log().info(
    `Output settings for pipeline '${pipeline.pipeline_name}/${pipeline.pipeline_id}'`,
    outputSettings
  );
  return outputSettings;
}
