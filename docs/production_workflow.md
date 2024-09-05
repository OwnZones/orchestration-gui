# Production Workflow

## Terminology

- System refers to the ateliere live backend
- Manager refers to this application.

## Assumptions

- The HQ & LD Pipelines have been started by the SystemController
- A ControlPanel have been created by the SystemController
- If any of the pipelines have active outputs OR have attached streams it should be considered active

## Setup

1. The user configures the production configuration and orders all sources in the order they want them to appear in the multiview.
2. The user selects a "Preset" containing

- LD & HQ Stream settings
- Pipeline names
- Control panel name

**DB Example**

```json
{
  "control_panel_name": "My Control Panel",
  "hq": {
    "pipeline_name": "High Quality",
    "default_stream_settings": {
      "alignment_ms": 200,
      "max_network_latency_ms": 50,
      "width": 1280,
      "height": 720,
      "frame_rate_d": 1,
      "frame_rate_n": 50,
      "format": "AVC",
      "encoder": "auto",
      "encoder_device": "auto",
      "gop_length": 50,
      "pic_mode": "pic_mode_ip",
      "video_kilobit_rate": 1000,
      "bit_depth": 8,
      "speed_quality_balance": "fastest",
      "convert_color_range": false,
      "audio_sampling_frequency": 48000
    },
    "output_settings": {
      "audio_format": "ADTS",
      "audio_kilobit_rate": 192,
      "format": "MPEG-TS-SRT",
      "ip": "0.0.0.0",
      "port": 9901,
      "video_bit_depth": 10,
      "video_format": "HEVC",
      "video_gop_length": 50,
      "video_kilobit_rate": 15000
    }
  },
  "ld": {
    "pipeline_name": "Low Delay",
    "default_stream_settings": {
      "alignment_ms": 200,
      "max_network_latency_ms": 50,
      "width": 1280,
      "height": 720,
      "frame_rate_d": 1,
      "frame_rate_n": 50,
      "format": "AVC",
      "encoder": "auto",
      "encoder_device": "auto",
      "gop_length": 50,
      "pic_mode": "pic_mode_ip",
      "video_kilobit_rate": 1000,
      "bit_depth": 8,
      "speed_quality_balance": "fastest",
      "convert_color_range": false,
      "audio_sampling_frequency": 48000
    },
    "output_settings": {
      "audio_format": "ADTS",
      "audio_kilobit_rate": 128,
      "format": "MPEG-TS-SRT",
      "ip": "0.0.0.0",
      "port": 9900,
      "video_bit_depth": 8,
      "video_format": "AVC",
      "video_gop_length": 50,
      "video_kilobit_rate": 1000
    }
  }
}
```

3. The user press "start"
4. If any of the pipelines are active a warning is shown indicating that the pipelines might be in use
5. The manager stops any existing outputs for both pipelines (?)
6. The manager disconnects any existing streams & multiviews from the selected pipelines
7. The manager connects the configured sources to the pipelines with `input_slot` being increments of 1 for each source.
8. The manager connects the control panel to the LD pipeline
9. The manager connects the LD control receiver to the HQ control receiver
10. The manager creates a new multi-view for the LD pipeline
11. The manager starts up an HQ Output & LD Output
12. The three output SRT addresses are shown in the GUI
13. The user press "stop"
14. The outputs are stopped
15. The multiviews removed
16. The streams disconnected
