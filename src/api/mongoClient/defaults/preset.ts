import { ObjectId } from 'mongodb';

export const defaultPreset = {
  name: 'LD+HQ Pipeline',
  control_connection: {
    control_panel_endpoint: {
      port: 4444,
      toPipelineIdx: 0
    },
    pipeline_control_connections: [
      { port: 4445, fromPipelineIdx: 0, toPipelineIdx: 1 }
    ]
  },
  default_multiview_reference: '6582ff61987fa290e66ba95c',
  pipelines: [
    {
      pipeline_readable_name: 'Low delay pipeline',
      ingest_id: '',
      source_id: null,
      pipeline_id: '',
      input_slot: null,
      alignment_ms: 1000,
      max_network_latency_ms: 50,
      width: 1280,
      height: 720,
      frame_rate_d: 1,
      frame_rate_n: 50,
      format: 'AVC',
      encoder: 'auto',
      encoder_device: 'auto',
      gop_length: 50,
      pic_mode: 'pic_mode_ip',
      video_kilobit_rate: 1000,
      bit_depth: 8,
      speed_quality_balance: 'fastest',
      convert_color_range: false,
      audio_sampling_frequency: 48000,
      audio_format: 'AAC-LC',
      audio_mapping: '[[0, 1]]',
      program_output: [
        {
          port: 9900,
          local_ip: '0.0.0.0',
          remote_ip: '0.0.0.0',
          format: 'MPEG-TS-SRT',
          srt_mode: 'listener',
          srt_latency_ms: 120,
          srt_passphrase: '',
          audio_format: 'ADTS',
          audio_kilobit_rate: 128,
          video_bit_depth: 8,
          video_format: 'AVC',
          video_gop_length: 50,
          video_kilobit_rate: 1000
        }
      ],
      interfaces: [
        {
          commit_rate: 100,
          port: null,
          protocol: 'SRT'
        }
      ]
    },
    {
      pipeline_readable_name: 'High quality pipeline',
      ingest_id: '',
      source_id: null,
      pipeline_id: '',
      input_slot: null,
      alignment_ms: 4000,
      max_network_latency_ms: 250,
      width: 1920,
      height: 1080,
      frame_rate_d: 1,
      frame_rate_n: 50,
      format: 'HEVC',
      encoder: 'auto',
      encoder_device: 'auto',
      gop_length: 50,
      pic_mode: 'pic_mode_ipb',
      video_kilobit_rate: 25000,
      bit_depth: 10,
      speed_quality_balance: 'better',
      convert_color_range: false,
      audio_sampling_frequency: 48000,
      audio_format: 'AAC-LC',
      audio_mapping: '[[0, 1]]',
      program_output: [
        {
          port: 9901,
          local_ip: '0.0.0.0',
          remote_ip: '0.0.0.0',
          format: 'MPEG-TS-SRT',
          srt_mode: 'listener',
          srt_latency_ms: 120,
          srt_passphrase: '',
          audio_format: 'ADTS',
          audio_kilobit_rate: 128,
          video_bit_depth: 10,
          video_format: 'HEVC',
          video_gop_length: 50,
          video_kilobit_rate: 25000,
          speed_quality_balance: 'better',
          pic_mode: 'pic_mode_ipb'
        }
      ],
      interfaces: [
        {
          commit_rate: 100,
          port: null,
          protocol: 'SRT'
        }
      ]
    }
  ]
};

export const ldOnlyPreset = {
  name: 'LD Only Pipeline',
  control_connection: {
    control_panel_endpoint: {
      port: 4444,
      toPipelineIdx: 0
    },
    pipeline_control_connections: []
  },
  default_multiview_reference: '6582ff61987fa290e66ba95c',
  pipelines: [
    {
      pipeline_readable_name: 'Pipeline',
      ingest_id: '',
      source_id: null,
      pipeline_id: '',
      input_slot: null,
      alignment_ms: 240,
      max_network_latency_ms: 50,
      width: 1280,
      height: 720,
      frame_rate_d: 1,
      frame_rate_n: 50,
      format: 'AVC',
      encoder: 'auto',
      encoder_device: 'auto',
      gop_length: 50,
      pic_mode: 'pic_mode_ip',
      video_kilobit_rate: 4000,
      bit_depth: 8,
      speed_quality_balance: 'fastest',
      convert_color_range: false,
      audio_sampling_frequency: 48000,
      audio_format: 'AAC-LC',
      audio_mapping: '[[0, 1]]',
      program_output: [
        {
          port: 9900,
          local_ip: '0.0.0.0',
          remote_ip: '0.0.0.0',
          format: 'MPEG-TS-SRT',
          srt_mode: 'listener',
          srt_latency_ms: 120,
          srt_passphrase: '',
          audio_format: 'ADTS',
          audio_kilobit_rate: 128,
          video_bit_depth: 8,
          video_format: 'AVC',
          video_gop_length: 50,
          video_kilobit_rate: 4000,
          speed_quality_balance: 'fastest',
          pic_mode: 'pic_mode_ip'
        }
      ],
      interfaces: [
        {
          commit_rate: 100,
          port: null,
          protocol: 'SRT'
        }
      ]
    }
  ]
};

export const defaultMultiview = [
  {
    _id: new ObjectId('6582ff61987fa290e66ba95c'),
    name: '10 inputs HD',
    layout: {
      output_height: 1080,
      output_width: 1920,
      views: [
        {
          input_slot: 1002,
          x: 0,
          y: 0,
          height: 540,
          width: 960,
          label: 'Preview'
        },
        {
          input_slot: 1001,
          x: 960,
          y: 0,
          height: 540,
          width: 960,
          label: 'Program'
        },
        {
          input_slot: 1,
          x: 0,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 1'
        },
        {
          input_slot: 2,
          x: 384,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 2'
        },
        {
          input_slot: 3,
          x: 768,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 3'
        },
        {
          input_slot: 4,
          x: 1152,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 4'
        },
        {
          input_slot: 5,
          x: 1536,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 5'
        },
        {
          input_slot: 6,
          x: 0,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 6'
        },
        {
          input_slot: 7,
          x: 384,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 7'
        },
        {
          input_slot: 8,
          x: 768,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 8'
        },
        {
          input_slot: 9,
          x: 1152,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 9'
        },
        {
          input_slot: 10,
          x: 1536,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 10'
        }
      ]
    },
    output: {
      format: 'MPEG-TS-SRT',
      frame_rate_d: 1,
      frame_rate_n: 50,
      local_ip: '0.0.0.0',
      local_port: 1234,
      remote_ip: '0.0.0.0',
      remote_port: 1234,
      srt_mode: 'listener',
      srt_latency_ms: 120,
      srt_passphrase: '',
      video_format: 'AVC',
      video_kilobit_rate: 5000,
      speed_quality_balance: 'balanced',
      pic_mode: 'pic_mode_ip'
    }
  },
  {
    _id: new ObjectId('65cb266c00fecda4a1faf977'),
    name: '13 inputs HD',
    layout: {
      output_height: 1080,
      output_width: 1920,
      views: [
        {
          input_slot: 1002,
          x: 0,
          y: 0,
          height: 540,
          width: 960,
          label: 'Preview'
        },
        {
          input_slot: 1001,
          x: 960,
          y: 0,
          height: 540,
          width: 960,
          label: 'Program'
        },
        {
          input_slot: 1,
          x: 0,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 1'
        },
        {
          input_slot: 2,
          x: 384,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 2'
        },
        {
          input_slot: 3,
          x: 768,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 3'
        },
        {
          input_slot: 4,
          x: 1152,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 4'
        },
        {
          input_slot: 5,
          x: 1536,
          y: 540,
          height: 270,
          width: 384,
          label: 'Input 5'
        },
        {
          input_slot: 6,
          x: 0,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 6'
        },
        {
          input_slot: 7,
          x: 384,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 7'
        },
        {
          input_slot: 8,
          x: 768,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 8'
        },
        {
          input_slot: 9,
          x: 1152,
          y: 810,
          height: 270,
          width: 384,
          label: 'Input 9'
        },
        {
          input_slot: 10,
          x: 1536,
          y: 810,
          height: 135,
          width: 192,
          label: 'VS'
        },
        {
          input_slot: 11,
          x: 1728,
          y: 810,
          height: 135,
          width: 192,
          label: 'UR'
        },
        {
          input_slot: 12,
          x: 1536,
          y: 945,
          height: 135,
          width: 192,
          label: 'OV'
        },
        {
          input_slot: 13,
          x: 1728,
          y: 945,
          height: 135,
          width: 192,
          label: 'CG'
        }
      ]
    },
    output: {
      format: 'MPEG-TS-SRT',
      frame_rate_d: 1,
      frame_rate_n: 50,
      local_ip: '0.0.0.0',
      local_port: 4567,
      remote_ip: '0.0.0.0',
      remote_port: 1234,
      srt_mode: 'listener',
      srt_latency_ms: 60,
      srt_passphrase: '',
      video_format: 'AVC',
      video_kilobit_rate: 5000,
      speed_quality_balance: 'balanced',
      pic_mode: 'pic_mode_ip'
    }
  }
];
