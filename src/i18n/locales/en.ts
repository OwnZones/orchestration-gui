export const en = {
  abort: 'Abort',
  confirm: 'Confirm',
  create: 'Create',
  auth: {
    username: 'Username',
    password: 'Password',
    sign_out: 'Sign out'
  },
  delete: {
    modal: 'Are you sure you want to delete: {{name}}?'
  },
  workflow: {
    start: 'Start',
    retry: 'Retry',
    start_modal: 'Are you sure you want to start: {{name}}?',
    stop: 'Stop',
    stop_modal: 'Are you sure you want to stop the production: {{name}}?',
    add_source_modal: 'Are you sure you want to add source: {{name}}?',
    remove_source_modal: 'Are you sure you want to remove source: {{name}}?',
    add_source: 'Add',
    remove_source: 'Remove'
  },
  start_production_status: {
    streams: 'Setup streams',
    control_panels: 'Connect control panels',
    pipeline_outputs: 'Setup pipeline outputs',
    multiviews: 'Create multiviews',
    sync: 'Synchronize database',
    start: 'Initialize',
    monitoring: 'Start runtime monitoring',
    unexpected: 'Unexpected error'
  },
  stop_production_status: {
    disconnect_connections: 'Disconnect connections',
    remove_pipeline_streams: 'Remove streams',
    remove_pipeline_multiviews: 'Remove multiviews',
    unexpected: 'Enexpeted error'
  },
  source: {
    type: 'Type: {{type}}',
    location: 'Location: {{location}}',
    ingest: 'Server: {{ingest}}',
    video: 'Video: {{video}}',
    audio: 'Audio: {{audio}}',
    orig: 'Original Name: {{name}}',
    metadata: 'Source Metadata',
    location_unknown: 'Unknown',
    last_connected: 'Last connection'
  },
  delete_source_status: {
    delete_stream: 'Delete stream',
    update_multiview: 'Update multiview',
    unexpected: 'Unexpected error'
  },
  add_source_status: {
    add_stream: 'Add stream',
    update_multiview: 'Update multiview',
    unexpected: 'Unexpected error'
  },
  empty_slot: {
    input_slot: 'Input slot'
  },
  production_configuration: 'Production Configuration',
  production: {
    add_source: 'Add Source',
    select_preset: 'Select Preset',
    clear_selection: 'Clear Selection',
    started: 'Production started: {{name}}',
    failed: 'Production start failed: {{name}}',
    stopped: 'Production stopped: {{name}}',
    stop_failed: 'Production stop failed: {{name}}',
    missing_multiview: 'Missing multiview reference in selected preset'
  },
  create_new: 'Create New',
  default_prod_placeholder: 'My New Configuration',
  homepage: 'Home',
  runtime_monitoring: {
    ingest: {
      description: 'Ingest used by production',
      name: 'active'
    },
    pipeline: {
      description: 'Pipeline used by production',
      name: 'active'
    },
    compact_control_panel: {
      description: 'Control panel used by production',
      name: 'active'
    },
    green_parameters: {
      title: 'Green parameters',
      description: 'Parameters that can raise an alarm'
    },
    red_parameters: {
      title: 'Red parameters',
      description: 'Error occured in the last minute'
    },
    name: 'Runtime Monitoring',
    to_main_screen: 'Back to main screen',
    control_receiver: {
      terminating: 'TERMINATING',
      forwarding: 'FORWARDING',
      delivered_requests: {
        name: 'delivered_requests',
        description:
          'The number of requests from other components that have been delivered to the Rendering Engine'
      },
      request_in_queue: {
        name: 'request_in_queue',
        description:
          'The number of requests in queue, waiting to be delivered to the Rendering Engine'
      },
      sent_responses: {
        name: 'sent_responses',
        description:
          'The number of responses to requests that was successfully sent'
      },
      failed_sent_responses: {
        name: 'failed_sent_responses',
        description: 'The number of responses to requests that failed to send'
      },
      sent_status_messages: {
        name: 'sent_status_messages',
        description:
          'The number of successfully sent status messages from this Control Receiver'
      },
      failed_sent_status_messages: {
        name: 'failed_sent_status_messages',
        description: 'The number of status messages that failed to be sent'
      },
      received_broken: {
        name: 'received_broken',
        description:
          'The number of responses and status messages that was received on this connection, but failed to be decoded'
      },
      received_request_count: {
        name: 'received_request_count',
        description: 'Number of requests received from the sender'
      },
      request_responses_count: {
        name: 'request_responses_count',
        description:
          'The number of responses to requests sent from this Control Receiver, counted per respondent UUID'
      },
      sent_requests: {
        name: 'sent_requests',
        description:
          'The number of successfully sent requests from this Control Receiver'
      },
      failed_sent_requests: {
        name: 'failed_sent_requests',
        description: 'The number of requests that failed to be sent'
      }
    },
    control_panel: {
      sent_requests: {
        name: 'sent_requests',
        description:
          'The number of successfully sent requests from this Control Panel'
      },
      failed_sent_requests: {
        name: 'failed_sent_requests',
        description: 'The number of requests that failed to be sent'
      },
      received_broken: {
        name: 'received_broken',
        description:
          'The number of responses and status messages that was received on this connection, but failed to be decoded'
      },
      request_responses_count: {
        name: 'request_responses_count',
        description: 'Number of request responses received from this respondent'
      },
      received_status_messages_count: {
        name: 'received_status_messages_count',
        description: 'Number of received status messages from this sender'
      }
    },
    multiview: {
      rendered_frames: {
        name: 'rendered_frames',
        description:
          'Number of multi-view frames that has been successfully rendered since this multi-view output started'
      },
      failed_rendered_frames: {
        name: 'failed_rendered_frames',
        description:
          'Number of multi-view frames that has failed to render since this multi-view output started'
      },
      encoded_audio_frames: {
        name: 'encoded_audio_frames',
        description:
          'The number of audio frames that have been successfully encoded since the stream started. Note that this metric will usually be lower than the number of video frames, as the audio is packed 1024 samples per packet using ADTS and a video frame in 50 FPS corresponds to 960 audio frames at 48000 Hz sampling rate.'
      },
      encoded_video_frames: {
        name: 'encoded_video_frames',
        description:
          'The number of video frames that have been successfully encoded since the stream started'
      },
      failed_encoded_audio_frames: {
        name: 'failed_encoded_audio_frames',
        description:
          'The number of audio frames that have failed to be encoded since the stream started'
      },
      failed_encoded_video_frames: {
        name: 'failed_encoded_video_frames',
        description:
          'The number of video frames that have failed to be encoded since the stream started'
      },
      muxed_audio_frames: {
        name: 'muxed_audio_frames',
        description: 'The number of muxed audio frames'
      },
      muxed_video_frames: {
        name: 'muxed_video_frames',
        description: 'The number of muxed video frames'
      },
      bandwidth_bps: {
        name: 'bandwidth_bps',
        description: 'Current bandwidth usage in bits per second'
      },
      sent_bytes: {
        name: 'sent_bytes',
        description: 'The number of bytes that have been sent on this interface'
      },
      sent_packets: {
        name: 'sent_packets',
        description:
          'The number of packets that have been sent on this interface. This also includes retransmitted packets.'
      },
      retransmitted_packets: {
        name: 'retransmitted_packets',
        description:
          'The number of packets that have been retransmitted on this interface'
      }
    },
    outputs: {
      received_frames: {
        name: 'received_frames',
        description: 'The number of frames received from the Rendering Engine'
      },
      received_video_frames: {
        name: 'received_video_frames',
        description:
          'The number of frames containing video received from the Rendering Engine'
      },
      received_audio_frames: {
        name: 'received_audio_frames',
        description:
          'The number of frames containing audio received from the Rendering Engine'
      },
      lost_frames: {
        name: 'lost_frames',
        description:
          'The number of lost (never received) frames from the Rendering Engine. The number is calculated based on the gaps in the series of timestamps of the frames received by the Output from the Rendering Engine.'
      },
      encoded_video_frames: {
        name: 'encoded_video_frames',
        description:
          'The number of video frames that have been successfully encoded since the stream started'
      },
      encoded_audio_frames: {
        name: 'encoded_audio_frames',
        description:
          'The number of audio frames that have been successfully encoded since the stream started. Note that this metric will usually be lower than the number of video frames, as the audio is packed 1024 samples per packet using ADTS and a video frame in 50 FPS corresponds to 960 audio frames at 48000 Hz sampling rate.'
      },
      failed_encoded_video_frames: {
        name: 'failed_encoded_video_frames',
        description:
          'The number of video frames that have failed to be encoded since the stream started'
      },
      failed_encoded_audio_frames: {
        name: 'failed_encoded_audio_frames',
        description:
          'The number of audio frames that have failed to be encoded since the stream started'
      },
      muxed_audio_frames: {
        name: 'muxed_audio_frame',
        description: 'The number of muxed audio frames'
      },
      muxed_video_frames: {
        name: 'muxed_video_frame',
        description: 'The number of muxed video frames'
      },
      bandwidth_bps: {
        name: 'bandwidth_bps',
        description: 'Current bandwidth usage in bits per second'
      },
      sent_bytes: {
        name: 'sent_bytes',
        description: 'The number of bytes that have been sent on this interface'
      },
      sent_packets: {
        name: 'sent_packets',
        description:
          'The number of packets that have been sent on this interface. This also includes retransmitted packets.'
      },
      retransmitted_packets: {
        name: 'retransmitted_packets',
        description:
          'The number of packets that have been retransmitted on this interface'
      }
    },
    sources: {
      dropped_video_frames: {
        name: 'dropped_video_frames',
        description:
          'The number of video frames that has been dropped from the source. A frame is dropped in case the source is delivering frames at a faster rate than the Ingest expects it to do.'
      },
      dropped_audio_frames: {
        name: 'dropped_audio_frames',
        description:
          'The number of audio frames that has been dropped from the source. A frame is dropped in case the source is delivering frames at a faster rate than the Ingest expects it to do.'
      },
      duplicated_video_frames: {
        name: 'duplicated_video_frames',
        description:
          'The number of video frames that has been duplicated by the ingest. If exactly one frame is missing, the ingest duplicates the coming frame to fill the gap.'
      },
      duplicated_audio_frames: {
        name: 'duplicated_audio_frames',
        description:
          'The number of audio frames that has been duplicated by the ingest. If exactly one frame is missing, the ingest duplicates the coming frame to fill the gap.'
      },
      lost_video_frames: {
        name: 'lost_video_frames',
        description:
          'The number of video frames that has been lost from the source. If more than one frame is missing from the source they are all added to this counter. If one frame is missing, it will not be added to this counter, but to the duplicated_frames counter.'
      },
      lost_audio_frames: {
        name: 'lost_audio_frames',
        description:
          'The number of audio frames that has been lost from the source. If more than one frame is missing from the source they are all added to this counter. If one frame is missing, it will not be added to this counter, but to the duplicated_frames counter.'
      },
      active: {
        name: 'active',
        description:
          'Flag to tell if the source is active or not. Active means that it is currently detected on the system and should be possible to start (if not already started). False if it cannot be detected now but it has been detected previously.'
      }
    },
    streams: {
      ingest: {
        grabbed_audio_frames: {
          name: 'grabbed_audio_frames',
          description:
            'The number of audio frames that have been grabbed from the input interface'
        },
        grabbed_video_frames: {
          name: 'grabbed_video_frames',
          description:
            'The number of video frames that have been grabbed from the input interface'
        },
        dropped_video_frames: {
          name: 'dropped_video_frames',
          description:
            'The number of video frames dropped due to the encoder queue being full'
        },
        video_frames_in_queue: {
          name: 'video_frames_in_queue',
          description:
            'The number of video frames currently in queue to the encoder'
        },
        encoded_audio_frames: {
          name: 'encoded_audio_frames',
          description:
            'The number of successfully encoded audio frames. Note that this will usually differ from the encoded_video_frames counter, as the audio is encoded in frames of 1024 samples, which does not match the number of audio samples per video frame (960 for 50 FPS)'
        },
        encoded_video_frames: {
          name: 'encoded_video_frames',
          description: 'The number of successfully encoded video frames'
        },
        failed_encoded_audio_frames: {
          name: 'failed_encoded_audio_frames',
          description:
            'The number of audio frames that failed encoding (either due to not being accepted by the encoder, or an internal error during the encoding)'
        },
        failed_encoded_video_frames: {
          name: 'failed_encoded_video_frames',
          description:
            'The number of video frames that failed encoding (either due to not being accepted by the encoder, or an internal error during the encoding)'
        },
        sent_audio_frames: {
          name: 'sent_audio_frames',
          description:
            'The number of audio frames that have been sent to the network. Note that this will usually differ from the sent_video_frames counter, as the audio is encoded in frames of 1024 samples, which does not match the number of audio samples per video frame (960 for 50 FPS)'
        },
        sent_video_frames: {
          name: 'sent_video_frames',
          description:
            'The number of video frames that have been sent to the network'
        },
        failed_sent_audio_frames: {
          name: 'failed_sent_audio_frames',
          description:
            'The number of audio frames that failed to be sent to the network layer'
        },
        failed_sent_video_frames: {
          name: 'failed_sent_video_frames',
          description:
            'The number of video frames that failed to be sent to the network layer'
        },
        video_kilobit_rate: {
          name: 'video_kilobit_rate',
          description: 'The kilobit rate of the video'
        },
        bandwidth_bps: {
          name: 'bandwidth_bps',
          description: 'Current bandwidth usage in bits per second'
        },
        sent_bytes: {
          name: 'sent_bytes',
          description:
            'The number of bytes that have been sent on this interface. This metric will only work for protocol SRT. For RIST the reported value will be 0.'
        },
        sent_packets: {
          name: 'sent_packets',
          description:
            'The number of packets that have been sent on this interface. This also includes retransmitted packets.'
        },
        retransmitted_packets: {
          name: 'retransmitted_packets',
          description:
            'The number of packets sent that were retransmissions on this interface'
        }
      },
      pipeline: {
        received_broken_frames: {
          name: 'received_broken_frames',
          description:
            'The number of frames (audio or video) that have been received broken by the receiver. This means some fragments of the frame have been lost on the network, but at least one part of the frame made it to the Pipeline. The frame will be discarded, as it cannot be decoded.'
        },
        lost_frames: {
          name: 'lost_frames',
          description:
            'The number of frames (audio or video) that have been recorded as lost on the network. This means that all the fragments of the frame have been lost during transport. This counter will be incremented once we receive the first frame after the lost frames, as it is first then we know we have lost frames.'
        },
        received_audio_frames: {
          name: 'received_audio_frames',
          description:
            'The number of audio frames that have been received from the network (Usually lower than the number of video frames, as the audio is packed 1024 samples per packet and a video frame in 50 FPS corresponds to 960 audio frames at 48000 Hz sampling rate)'
        },
        received_video_frames: {
          name: 'received_video_frames',
          description:
            'The number of video frames that have been received from the network'
        },
        video_frames_in_queue: {
          name: 'video_frames_in_queue',
          description:
            'The number of video frames currently in queue to the video decoder'
        },
        decoded_audio_frames: {
          name: 'decoded_audio_frames',
          description: 'The number of successfully decoded audio frames'
        },
        decoded_video_frames: {
          name: 'decoded_video_frames',
          description: 'The number of successfully decoded video frames'
        },
        failed_decoded_audio_frames: {
          name: 'failed_decoded_audio_frames',
          description: 'The number of audio frames that failed to decode'
        },
        failed_decoded_video_frames: {
          name: 'failed_decoded_video_frames',
          description: 'The number of video frames that failed to decode'
        },
        delivered_frames: {
          name: 'delivered_frames',
          description:
            'The number of audio/video frames delivered to the rendering engine on time'
        },
        dropped_frames: {
          name: 'dropped_frames',
          description:
            'The number of audio/video frames dropped due to being too late'
        },
        bandwidth_bps: {
          name: 'bandwidth_bps',
          description: 'Current bandwidth usage in bits per second'
        },
        received_bytes: {
          name: 'received_bytes',
          description:
            'The number of bytes that has been received on this interface. This metric will only work for protocol SRT. For RIST the reported value will be 0.'
        },
        received_packets: {
          name: 'received_packets',
          description:
            'The number of packets that has been received on this interface'
        },
        lost_packets: {
          name: 'lost_packets',
          description:
            'The number of unique original packets that has been recorded as lost by the receiving side of this interface. These lost packets may be recovered by retransmissions and then not be counted as "dropped" packets.'
        },
        dropped_packets: {
          name: 'dropped_packets',
          description:
            'The number of packets that has been recorded as dropped (unrecovered, permanently missing) by the receiving side of this interface.'
        }
      }
    }
  },
  inventory: 'Inventory Management',
  inventory_list: {
    search: 'Search',
    filter: 'Filter on {{type}}',
    types: 'Type',
    locations: 'Location',
    active_sources: 'Active Sources',
    add: 'Add',
    edit: 'Edit',
    sort_by: 'Sort by',
    no_sorting_applied: 'No sorting selected',
    most_recent_connection: 'Most recent connection'
  },
  clear: 'Clear',
  apply: 'Apply',
  save: 'Save',
  saved: 'Saved!',
  name: 'Name',
  location: 'Location',
  type: 'Type',
  discard: 'Discard',
  close: 'Close',
  no: 'No',
  yes: 'Yes',
  video: 'Video',
  audio: 'Audio',
  sample_rate: 'Sample rate',
  is_running: 'Production is running',
  audio_mapping: {
    channel: 'Channel',
    out: 'Out',
    outL: 'Out L',
    outR: 'Out R',
    maxError: 'Maximum value is {{max}}',
    minError: 'Minimum value is 1',
    alreadyUsed: 'The value {{value}} is already used',
    emptyBetween: "You can't have empty channels between two numbers",
    title: 'Audio mapping'
  },
  copy: 'Copy stream-url',
  copied: 'Copied',
  not_copied: 'Error',
  open_in_vlc: 'Open multiview in VLC',
  open_in_web: 'Open multiview in browser',
  start_production_errors: {
    db: "Can't connect to Database",
    get_pipelines: "Can't get Pipelines",
    source: "Can't get Source",
    get_control_receivers: "Can't get Control Receivers",
    disconnect_receiver: "Can't disconnect receiver",
    remove_pipeline_stream: "Can't remove Pipeline Streams",
    remove_multiview: "Can't remove Multiviews from Pipeline",
    get_uuid: "Can't get UUID from Ingest name",
    source_id: "Can't get source id from source name",
    ingest_to_pipeline: "Can't connect Ingest to Pipeline",
    get_control_panel: "Can't get Control Panel",
    get_receiver_for_ld: "Can't get Control Receivers for LD pipeline",
    get_receiver_for_hq: "Can't get Control Receiver for HQ pipeline",
    get_ld: "Can't get LD Pipeline",
    get_hq: "Can't get HQ Pipeline",
    pipeline_outputs: "Can't get Pipeline outputs",
    start_pipeline: "Can't start Pipeline Stream",
    multiview: "Can't create multiview",
    get_audiomap: "Can't get audiomapping values",
    no_pipeline_found: 'Did not find pipeline',
    pipeline_already_in_use: 'Pipeline already in use',
    control_panel_already_in_use: 'Control panel already in use',
    no_pipeline_selected: 'No pipeline selected',
    same_pipeline_selected: 'Same pipeline selected',
    no_control_panel_selected: 'No control panel selected'
  },
  source_error: {
    get_uuid: "Can't get UUID from Ingest name",
    ingest_to_pipeline: "Can't connect Ingest to Pipeline",
    missing_pipeline_uuid: 'Production configuration is missing pipeline_id',
    no_multiview_found_for_pipeline: 'No multiview found for pipeline',
    no_view_found_for_input_slot: 'No view found for specified input slot',
    delete_source: "Can't remove source"
  },
  online: 'ONLINE',
  offline: 'OFFLINE',
  refresh_images: 'Refresh Thumbnails',
  server_error: 'No connection with {{string}}',
  system_controller: 'System controller',
  database: 'Database',
  application: 'Application',
  multiview: 'Multiview',
  setting_up: 'Setting up connections to external API:s...',
  preset: {
    preset_necessary: 'Preset must be selected!',
    low_delay: 'Low Delay Pipeline',
    high_quality: 'High Quality Pipeline',
    ip: 'IP',
    port: 'Port',
    mode: 'Mode',
    srt_passphrase: 'Passphrase',
    video_settings: 'Video settings',
    video_format: 'Format',
    video_bit_depth: 'Bit depth',
    video_kilobit_rate: 'Kilobit rate',
    add_stream: 'Add stream',
    stream_name: 'Stream',
    multiview_output_settings: 'Multiview output',
    select_multiview_preset: 'Preset',
    no_multiview_selected: 'No multiview selected',
    no_multiview_found: 'No multiview found',
    no_port_selected: 'Unique port needed'
  },
  error: {
    missing_sources_in_db: 'Missing sources, please restart production.',
    invalid_streams: 'Streams can not have identical IP and Port.',
    unexpected: 'An unexpected error occured',
    message: 'Message'
  }
};
