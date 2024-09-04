import { ObjectId, WithId } from 'mongodb';
export type SourceType = 'camera' | 'graphics' | 'microphone';
export type SourceStatus = 'ready' | 'new' | 'gone';
export type VideoStream = {
  height?: number;
  width?: number;
  frame_rate?: number;
};

export type AudioStream = {
  number_of_channels?: number;
  sample_rate?: number;
  audio_mapping?: (number | number[])[];
};

export type Numbers = number | number[];

export interface Source {
  _id?: ObjectId;
  status: SourceStatus;
  name: string;
  type: SourceType;
  tags: {
    location: string;
    [key: string]: string | undefined;
  };
  ingest_name: string;
  ingest_source_name: string;
  ingest_type: string;
  video_stream: VideoStream;
  audio_stream: AudioStream;
  lastConnected: Date;
}

export interface SourceReference {
  _id: string;
  label: string;
  stream_uuids?: string[];
  input_slot: number;
}

export type SourceWithId = WithId<Source>;

export interface SourceToPipelineStream {
  source_id: string;
  stream_uuid: string;
  input_slot: number;
}

export interface DeleteSourceStep {
  step: 'delete_stream' | 'update_multiview' | 'unexpected';
  success: boolean;
  message?: string;
}

export interface DeleteSourceStatus {
  success: boolean;
  steps: DeleteSourceStep[];
}

export interface AddSourceStep {
  step: 'add_stream' | 'update_multiview' | 'unexpected';
  success: boolean;
  message?: string;
}

export interface AddSourceStatus {
  success: boolean;
  steps: AddSourceStep[];
}

export type AddSourceResult =
  | {
      success: true;
      streams: SourceToPipelineStream[];
      steps: AddSourceStep[];
    }
  | {
      success: false;
      steps: AddSourceStep[];
    };
