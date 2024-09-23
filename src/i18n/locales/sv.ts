import { Localization } from './type';

export const sv = {
  abort: 'Avbryt',
  confirm: 'Bekräfta',
  create: 'Skapa',
  auth: {
    username: 'Användarnamn',
    password: 'Lösenord',
    sign_out: 'Logga ut'
  },
  delete: {
    modal: 'Är du säker på att du vill ta bort: {{name}}?'
  },
  workflow: {
    start: 'Starta',
    retry: 'Försök igen',
    start_modal: 'Är du säker på att du vill starta: {{name}}?',
    stop: 'Stoppa',
    stop_modal: 'Är du säker på att du vill stoppa produktionen: {{name}}?',
    add_source_modal: 'Är du säker på att du vill lägga till källan: {{name}}?',
    remove_source_modal: 'Är du säker på att du vill ta bort källan: {{name}}?',
    add_source: 'Lägg till',
    remove_source: 'Ta bort'
  },
  start_production_status: {
    streams: 'Ställ in strömmar',
    control_panels: 'Anslut kontrollpaneler',
    pipeline_outputs: 'Ställ in pipelineutgångar',
    multiviews: 'Skapa multiviews',
    sync: 'Synkronisera databasen',
    monitoring: 'Starta monitorering',
    start: 'Påbörja',
    unexpected: 'Oväntat fel'
  },
  stop_production_status: {
    disconnect_connections: 'Frånkoppla anslutningar',
    remove_pipeline_streams: 'Ta bort strömmar',
    remove_pipeline_multiviews: 'Ta bort multiviews',
    unexpected: 'Oväntat fel'
  },
  source: {
    type: 'Typ: {{type}}',
    location: 'Plats: {{location}}',
    ingest: 'Server: {{ingest}}',
    video: 'Video: {{video}}',
    audio: 'Ljud: {{audio}}',
    orig: 'Enhetsnamn: {{name}}',
    metadata: 'Käll-metadata',
    location_unknown: 'Okänd',
    last_connected: 'Senast uppkoppling',
    input_slot: 'Ingång: {{input_slot}}'
  },
  delete_source_status: {
    delete_stream: 'Radera ström',
    update_multiview: 'Uppdatera multiview',
    unexpected: 'Oväntat fel'
  },
  add_source_status: {
    add_stream: 'Lägg till ström',
    update_multiview: 'Uppdatera multiview',
    unexpected: 'Oväntat fel'
  },
  empty_slot: {
    input_slot: 'Ingång'
  },
  production_configuration: 'Produktionskonfiguration',
  production: {
    add_source: 'Lägg till ingång',
    select_preset: 'Välj produktionsmall',
    clear_selection: 'Rensa val',
    started: 'Produktion startad: {{name}}',
    failed: 'Start av produktion misslyckades: {{name}}',
    stopped: 'Produktion stoppad: {{name}}',
    stop_failed: 'Stopp av produktion misslyckades: {{name}}',
    missing_multiview: 'Saknar referens till en multiview i valt preset',
    source: 'Källa',
    add: 'Lägg till',
    add_other_source_type: 'Lägg till annan källtyp'
  },
  create_new: 'Skapa ny',
  default_prod_placeholder: 'Min Nya Konfiguration',
  homepage: 'Startsidan',
  runtime_monitoring: {
    name: 'Monitorering',
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
      title: 'Gröna parametrar',
      description: 'Parametrar som kan få ett alarm'
    },
    red_parameters: {
      title: 'Röda parametrar',
      description: 'Ett fel har inträffat den senaste minuten'
    },
    to_main_screen: 'Tillbaka till startsidan',
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
          'The number of packets that have been sent on this interface. This also includes retransmitted packets.'
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
  inventory: 'Källhantering',
  inventory_list: {
    search: 'Sök',
    filter: 'Filtrera på {{type}}',
    types: 'Typ',
    locations: 'Plats',
    active_sources: 'Aktiva källor',
    add: 'Lägg till',
    edit: 'Redigera',
    sort_by: 'Sortera på',
    no_sorting_applied: 'Ingen sortering vald',
    most_recent_connection: 'Senast anslutning'
  },
  clear: 'Rensa',
  apply: 'Applicera',
  save: 'Spara',
  saved: 'Sparat!',
  name: 'Namn',
  location: 'Plats',
  type: 'Typ',
  discard: 'Ångra',
  close: 'Stäng',
  no: 'Nej',
  yes: 'Ja',
  video: 'Video',
  audio: 'Ljud',
  sample_rate: 'Samplingsfrekvens',
  is_running: 'Produktion körs',
  audio_mapping: {
    channel: 'Kanal',
    out: 'Ut',
    outL: 'Ut V',
    outR: 'Ut H',
    maxError: 'Max värde är {{max}}',
    minError: 'Minsta värde är 1',
    alreadyUsed: 'Värdet {{value}} är redan användt',
    emptyBetween: 'Du kan inte ha tomma kanaler mellan två nummer',
    title: 'Ljudmappning'
  },
  copy: 'Kopiera stream-url',
  copied: 'Kopierad',
  not_copied: 'Error',
  open_in_vlc: 'Öppna multiview i VLC',
  open_in_web: 'Öppna multiview i webbläsare',
  start_production_errors: {
    db: 'Kan inte ansluta till Databasen',
    get_pipelines: 'Kan inte hämta Pipelines',
    source: 'Kan inte hämta Källan',
    get_control_receivers: 'Kan inte hämta Kontrollmottagaren',
    disconnect_receiver: 'Kan inte koppla från mottagaren',
    remove_pipeline_stream: 'Kan inte ta bort Pipeline Källan',
    remove_multiview: 'Kan inte ta bort Flerskärmsläge från Pipelinen',
    get_uuid: 'Kan inte hämta UUID från Ingest namnet',
    source_id: 'Kan inte hämta källid från källnamnet',
    ingest_to_pipeline: 'Kan inte ansluta Ingest till Pipelinen',
    get_control_panel: 'Kan inte hämta Kontrollpanelen',
    get_receiver_for_ld: 'Kan inte hämta Kontrollmottagaren för LD pipeline',
    get_receiver_for_hq: 'Kan inte hämta Kontrollmottagaren för HQ pipeline',
    get_ld: 'Kan inte hämta LD Pipelinen',
    get_hq: 'Kan inte hämta HQ Pipelinen',
    pipeline_outputs: 'Kan inte hämta Pipelinens utgångar',
    start_pipeline: 'Kan inte starta Pipeline Källan',
    multiview: 'Kan inte skapa Flerskärmsläge',
    get_audiomap: 'Kan inte hämta ljudmappnings värdena',
    no_pipeline_found: 'Hittade inte  någon pipeline',
    pipeline_already_in_use: 'Pipeline upptagen',
    control_panel_already_in_use: 'Kontrollpanel upptagen',
    no_pipeline_selected: 'Ingen pipeline vald',
    same_pipeline_selected: 'Samma pipeline vald',
    no_control_panel_selected: 'Ingen kontrollpanel vald'
  },
  source_error: {
    get_uuid: 'Kan inte hämta UUID från Ingest namnet',
    ingest_to_pipeline: 'Kan inte ansluta Ingest till Pipelinen',
    missing_pipeline_uuid: 'Produktionskonfigurationen saknar pipeline_id',
    no_multiview_found_for_pipeline: 'Kunde inte hitta någon multiview',
    no_view_found_for_input_slot:
      'Kunde inte hitta en view för den valda platsen',
    delete_source: 'Kan inte ta bort källa'
  },
  online: 'ONLINE',
  offline: 'OFFLINE',
  refresh_images: 'Uppdatera Tumnaglar',
  server_error: '{{string}}:n inte ansluten',
  system_controller: 'Systemkontroller',
  database: 'Databas',
  application: 'Program',
  multiview: 'Multiview',
  setting_up: 'Sätter upp anslutning till externa API:n...',
  preset: {
    preset_necessary: 'Preset must be selected!',
    low_delay: 'Low Delay Pipeline',
    high_quality: 'High Quality Pipeline',
    ip: 'IP',
    port: 'Port',
    mode: 'Läge',
    srt_passphrase: 'Lösenord',
    video_settings: 'Videoinställningar',
    video_format: 'Format',
    video_bit_depth: 'Bit depth',
    video_kilobit_rate: 'Kilobit rate',
    add_stream: 'Lägg till ström',
    stream_name: 'Ström',
    multiview_output_settings: 'Multiview utgång',
    no_multiview_selected: 'Ingen multiview vald',
    no_multiview_found: 'Hittade ingen multiview',
    select_multiview_layout: 'Komposition',
    configure_layout: 'Justera komposition',
    create_layout: 'Skapa komposition',
    update_layout: 'Uppdatera komposition',
    no_updated_layout: 'Ingen uppdaterad komposition',
    new_preset_name: 'Min komposition',
    muliview_view: 'Ingång',
    select_option: 'Välj',
    select_multiview_preset: 'Förinställningar',
    no_port_selected: 'Unik port krävs'
  },
  error: {
    missing_sources_in_db: 'Källor saknas, var god starta om produktionen.',
    invalid_streams: 'Strömmar får ej ha samma port och IP.',
    unexpected: 'Ett oväntat fel inträffade',
    message: 'Meddelande'
  }
} satisfies Localization;
