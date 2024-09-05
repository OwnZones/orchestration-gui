export const expectedDedicatedPorts = () => {
  const temp = new Map<string, Set<number>>();

  temp.set(
    'ingest',
    new Set([...Array(20).keys()].map((increment) => 9000 + increment))
  );
  temp.set('renderingengine', new Set([9900, 9901]));
  temp.set('multiview', new Set([1234]));
  temp.set('controlpanel', new Set([4444, 4445]));

  return temp;
};

export const mockedPipelines = [
  {
    uuid: '6c6cfe72-9137-5b70-ff55-0dd6a1f6ba6e',
    name: 'LD_Pipeline',
    type: 'pipeline',
    version: '11.0.0',
    streams: [
      {
        stream_uuid: 'b84d5fba-dcaa-420b-8f99-6718b6675563',
        ingest_uuid: 'acd2bd73-d016-d827-c97a-f3248b0d4647',
        source_id: 3,
        input_slot: 1,
        max_network_latency_ms: 50,
        alignment_ms: 1000,
        interfaces: [
          {
            port: 9004,
            protocol: 'SRT',
            received_bytes: 1070364593,
            received_packets: 1032101,
            dropped_packets: 0,
            lost_packets: 184989,
            round_trip_time_ms: {
              avg: 0,
              min: 0,
              max: 0
            },
            bandwidth_bps: 1218628
          }
        ],
        format: 'AVC',
        width: 1280,
        height: 720,
        frame_rate_n: 50,
        frame_rate_d: 1,
        convert_color_range: false,
        audio_format: 'AAC-LC',
        audio_sampling_frequency: 48000,
        received_video_frames: 351330,
        received_audio_frames: 329372,
        received_broken_frames: 0,
        lost_frames: 0,
        video_frames_in_queue: 36,
        decoded_video_frames: 351293,
        failed_decoded_video_frames: 0,
        decoded_audio_frames: 329372,
        failed_decoded_audio_frames: 0,
        delivered_frames: 351265,
        dropped_frames: 37,
        time_to_arrival_audio: {
          avg: 53401,
          min: 38465,
          max: 66529
        },
        time_to_arrival_video: {
          avg: 50528,
          min: 42071,
          max: 64734
        },
        time_to_ready_audio: {
          avg: 147882,
          min: 137170,
          max: 167344
        },
        time_to_ready_video: {
          avg: 791362,
          min: 782157,
          max: 805674
        },
        video_decode_duration: {
          avg: 20853,
          min: 1734,
          max: 42425
        },
        audio_decode_duration: {
          avg: 101,
          min: 84,
          max: 160
        }
      }
    ],
    feedback_streams: [
      {
        input_slot: 1001,
        name: 'Program'
      },
      {
        input_slot: 1002,
        name: 'Preview'
      }
    ],
    multiviews: [
      {
        id: 0,
        layout: {
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
              label: 'MIKAEL-STARDOM-INSTANCE (NDI_1)'
            }
          ],
          output_height: 1080,
          output_width: 1920
        },
        output: {
          rendered_frames: 351210,
          failed_rendered_frames: 0,
          rendering_duration: {
            avg: 551,
            min: 470,
            max: 1003
          },
          frame_rate_n: 50,
          frame_rate_d: 1,
          format: 'MPEG-TS-SRT',
          mpeg_ts_srt: {
            video_format: 'AVC',
            video_kilobit_rate: 5000,
            video_bit_depth: 0,
            video_gop_length: 50,
            audio_format: 'ADTS',
            audio_kilobit_rate: 0,
            encoded_video_frames: 351207,
            failed_encoded_video_frames: 0,
            encoded_audio_frames: 0,
            failed_encoded_audio_frames: 0,
            muxed_audio_frames: 0,
            muxed_video_frames: 351207,
            srt_mode: 'listener',
            local_ip: '0.0.0.0',
            local_port: 1234,
            clients: []
          }
        }
      }
    ],
    outputs: [
      {
        uuid: '8342a582-7723-0779-c549-99f9623bbf26',
        name: 'LD_Pipeline',
        parent_uuid: '6c6cfe72-9137-5b70-ff55-0dd6a1f6ba6e',
        type: 'output',
        version: '11.0.0',
        status: {
          active_stream: {
            format: 'MPEG-TS-SRT',
            mpeg_ts_srt: {
              video_format: 'AVC',
              video_kilobit_rate: 1000,
              video_bit_depth: 8,
              video_gop_length: 50,
              audio_format: 'ADTS',
              audio_kilobit_rate: 128,
              encoded_video_frames: 351265,
              failed_encoded_video_frames: 0,
              encoded_audio_frames: 329313,
              failed_encoded_audio_frames: 0,
              muxed_audio_frames: 329313,
              muxed_video_frames: 351265,
              srt_mode: 'listener',
              local_ip: '0.0.0.0',
              local_port: 9900,
              clients: []
            }
          },
          lost_frames: 28,
          received_frames: 351316,
          received_video_frames: 351316,
          received_audio_frames: 351316,
          cpu_load: 4.4554443,
          gpu_load_sm: 13,
          gpu_load_encoder: 70,
          gpu_load_decoder: 3,
          width: 1280,
          height: 720,
          frame_rate_n: 50,
          frame_rate_d: 1
        }
      }
    ],
    control_receivers: [
      {
        uuid: '3f3ec840-c2c9-8da3-6af3-d154518b842d',
        name: 'LD_Pipeline',
        parent_uuid: '6c6cfe72-9137-5b70-ff55-0dd6a1f6ba6e',
        type: 'control_receiver',
        version: '11.0.0',
        status: {
          connected_to: [
            {
              connection_uuid: 'b3eaebd4-c064-4246-bf38-5e02355a660c',
              receiver_uuid: 'ea673cb0-53b0-e63e-b457-e65437e67c32',
              ip: '34.147.117.6',
              port: 4445,
              received_broken: 0
            }
          ],
          listening_interface: {
            ip: '0.0.0.0',
            port: 4444,
            connected_senders: [
              {
                connection_uuid: '7c649ebe-02e4-452f-832d-3c98e8581159',
                sender_uuid: '22232e47-0a90-beed-497a-fa5b322a29b2',
                ip: '34.147.117.6',
                port: 54626,
                message_delay_ms: 200,
                received_broken: 0,
                transport_duration: {
                  avg: 384,
                  min: 348,
                  max: 409
                }
              }
            ],
            pending_connection: undefined
          },
          sent_requests: 0,
          failed_sent_requests: 0,
          sent_status_messages: 0,
          failed_sent_status_messages: 0,
          delivered_requests: 6,
          sent_responses: 6,
          failed_sent_responses: 0,
          requests_in_queue: 0,
          request_responses: [],
          received_requests: [
            {
              sender_uuid: '22232e47-0a90-beed-497a-fa5b322a29b2',
              count: 6
            }
          ]
        }
      }
    ]
  },
  {
    uuid: 'b0cafef4-b189-0793-e4c1-4db7c3101b66',
    name: 'HQ_Pipeline',
    type: 'pipeline',
    version: '11.0.0',
    streams: [
      {
        stream_uuid: '81a84cce-9a36-4531-9a12-465d0b0fa5a2',
        ingest_uuid: 'acd2bd73-d016-d827-c97a-f3248b0d4647',
        source_id: 3,
        input_slot: 1,
        max_network_latency_ms: 250,
        alignment_ms: 4000,
        interfaces: [
          {
            port: 9102,
            protocol: 'SRT',
            received_bytes: 185522196,
            received_packets: 606729,
            dropped_packets: 0,
            lost_packets: 0,
            round_trip_time_ms: {
              avg: 0,
              min: 0,
              max: 0
            },
            bandwidth_bps: 236974
          }
        ],
        format: 'HEVC',
        width: 1920,
        height: 1080,
        frame_rate_n: 50,
        frame_rate_d: 1,
        convert_color_range: false,
        audio_format: 'AAC-LC',
        audio_sampling_frequency: 48000,
        received_video_frames: 313137,
        received_audio_frames: 293566,
        received_broken_frames: 0,
        lost_frames: 0,
        video_frames_in_queue: 174,
        decoded_video_frames: 312961,
        failed_decoded_video_frames: 0,
        decoded_audio_frames: 293566,
        failed_decoded_audio_frames: 0,
        delivered_frames: 312950,
        dropped_frames: 0,
        time_to_arrival_audio: {
          avg: 250626,
          min: 238546,
          max: 266483
        },
        time_to_arrival_video: {
          avg: 271439,
          min: 247280,
          max: 292817
        },
        time_to_ready_audio: {
          avg: 344908,
          min: 337078,
          max: 367441
        },
        time_to_ready_video: {
          avg: 3795503,
          min: 3781404,
          max: 3827880
        },
        video_decode_duration: {
          avg: 40739,
          min: 1762,
          max: 90204
        },
        audio_decode_duration: {
          avg: 99,
          min: 85,
          max: 135
        }
      }
    ],
    feedback_streams: [
      {
        input_slot: 1001,
        name: 'Program'
      },
      {
        input_slot: 1002,
        name: 'Preview'
      }
    ],
    multiviews: [],
    outputs: [
      {
        uuid: '555edd9a-0146-1ca7-0583-334e21eecc36',
        name: 'HQ_Pipeline',
        parent_uuid: 'b0cafef4-b189-0793-e4c1-4db7c3101b66',
        type: 'output',
        version: '11.0.0',
        status: {
          active_stream: {
            format: 'MPEG-TS-SRT',
            mpeg_ts_srt: {
              video_format: 'HEVC',
              video_kilobit_rate: 25000,
              video_bit_depth: 10,
              video_gop_length: 50,
              audio_format: 'ADTS',
              audio_kilobit_rate: 128,
              encoded_video_frames: 313120,
              failed_encoded_video_frames: 0,
              encoded_audio_frames: 293552,
              failed_encoded_audio_frames: 0,
              muxed_audio_frames: 293552,
              muxed_video_frames: 313120,
              srt_mode: 'listener',
              local_ip: '0.0.0.0',
              local_port: 9901,
              clients: []
            }
          },
          lost_frames: 2,
          received_frames: 313157,
          received_video_frames: 313157,
          received_audio_frames: 313157,
          cpu_load: 4.9261093,
          gpu_load_sm: 13,
          gpu_load_encoder: 69,
          gpu_load_decoder: 4,
          width: 1920,
          height: 1080,
          frame_rate_n: 50,
          frame_rate_d: 1
        }
      }
    ],
    control_receivers: [
      {
        uuid: 'ea673cb0-53b0-e63e-b457-e65437e67c32',
        name: 'HQ_Pipeline',
        parent_uuid: 'b0cafef4-b189-0793-e4c1-4db7c3101b66',
        type: 'control_receiver',
        version: '11.0.0',
        status: {
          connected_to: [],
          listening_interface: {
            ip: '0.0.0.0',
            port: 4445,
            connected_senders: [
              {
                connection_uuid: 'b3eaebd4-c064-4246-bf38-5e02355a660c',
                sender_uuid: '3f3ec840-c2c9-8da3-6af3-d154518b842d',
                ip: '34.147.117.6',
                port: 43560,
                message_delay_ms: 3200,
                received_broken: 0,
                transport_duration: {
                  avg: 0,
                  min: 0,
                  max: 0
                }
              }
            ],
            pending_connection: undefined
          },
          sent_requests: 0,
          failed_sent_requests: 0,
          sent_status_messages: 0,
          failed_sent_status_messages: 0,
          delivered_requests: 0,
          sent_responses: 0,
          failed_sent_responses: 0,
          requests_in_queue: 0,
          request_responses: [],
          received_requests: []
        }
      }
    ]
  }
];
