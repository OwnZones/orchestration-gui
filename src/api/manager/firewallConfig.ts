import { ObjectId } from 'mongodb';
import {
  FwConfig,
  FwConfigType,
  FwConfigWithId
} from '../../interfaces/firewallConfig';
import { getDatabase } from '../mongoClient/dbClient';

export async function getFwConfigs(): Promise<FwConfigWithId[]> {
  const db = await getDatabase();
  return await db.collection<FwConfig>('fw_config').find().toArray();
}

export async function getFwConfigByNameAndType(
  name: string,
  type: string
): Promise<FwConfigWithId> {
  const db = await getDatabase();
  return (await db
    .collection('fw_config')
    .findOne({ name: name, type: type })) as FwConfigWithId;
}

export async function getFwConfigsByType(
  type: FwConfigType
): Promise<FwConfigWithId[]> {
  const db = await getDatabase();
  return await db
    .collection<FwConfigWithId>('fw_config')
    .find({ type: type })
    .toArray();
}

export async function getFwConfigById(id: string): Promise<FwConfigWithId> {
  const db = await getDatabase();
  return (await db
    .collection('fw_config')
    .findOne({ _id: new ObjectId(id) })) as FwConfigWithId;
}

export async function putFwConfig(
  id: string,
  fwConfig: FwConfigWithId
): Promise<void> {
  const db = await getDatabase();
  await db.collection('fw_config').findOneAndReplace(
    { _id: new ObjectId(id) },
    {
      name: fwConfig.name,
      type: fwConfig.type,
      port_range_allow: fwConfig.port_range_allow,
      last_used_port_index: fwConfig.last_used_port_index
    }
  );
}

export async function putFwConfigLastUsedPortIndex(
  fwConfig: FwConfigWithId
): Promise<void> {
  const db = await getDatabase();

  const result = await db
    .collection('fw_config')
    .findOneAndUpdate(
      { _id: fwConfig._id },
      { $set: { last_used_port_index: fwConfig.last_used_port_index } }
    );
  if (!result.value) {
    console.log('Failed to update firewall rules with last used port:', result);
  }
}
