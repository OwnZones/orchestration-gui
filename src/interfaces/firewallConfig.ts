import { WithId } from 'mongodb';

export type FwConfigType = 'ingest';

export enum FwConfigTypeEnum {
  Ingest = 'ingest'
}

export interface FwConfig {
  name: string;
  type: FwConfigType;
  port_range_allow: number[];
  last_used_port_index: number;
}

export type FwConfigWithId = WithId<FwConfig>;
