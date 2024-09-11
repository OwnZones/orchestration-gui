import { WithId, Document, ObjectId } from 'mongodb';
import { SourceReference } from './Source';
import { ControlConnection } from './controlConnections';
import { PipelineSettings } from './pipeline';

export interface HtmlReference {
  _id: string;
  input_slot: number;
  label: string;
}

export interface MediaplayerReference {
  _id: string;
  input_slot: number;
  label: string;
}

export interface Production {
  _id: string;
  isActive: boolean;
  name: string;
  sources: SourceReference[];
  html: HtmlReference[];
  mediaplayers: MediaplayerReference[];
  production_settings: ProductionSettings;
}

export interface ProductionWithId extends WithId<Document> {
  _id: ObjectId;
  isActive: boolean;
  name: string;
  sources: SourceReference[];
  production_settings: ProductionSettings;
}

export interface ProductionSettings {
  _id?: ObjectId;
  control_connection: ProductionControlConnection;
  pipelines: PipelineSettings[];
  name: string;
}

interface ProductionControlConnection extends ControlConnection {
  control_panel_name?: string[];
}

export interface StartProductionStatus {
  success: boolean;
  steps: StartProductionStep[];
}

export interface StartProductionStep {
  step:
    | 'streams'
    | 'control_panels'
    | 'pipeline_outputs'
    | 'multiviews'
    | 'sync'
    | 'monitoring'
    | 'unexpected'
    | 'start';
  success: boolean;
  message?: string;
}

export interface StopProductionStatus {
  success: boolean;
  steps: StopProductionStep[];
}

export interface StopProductionStep {
  step:
    | 'disconnect_connections'
    | 'remove_pipeline_streams'
    | 'remove_pipeline_multiviews'
    | 'unexpected';
  success: boolean;
  message?: string;
}
