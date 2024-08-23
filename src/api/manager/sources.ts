import inventory from './mocks/inventory.json';
import { Source } from '../../interfaces/Source';
import { ObjectId, OptionalId } from 'mongodb';
import { getDatabase } from '../mongoClient/dbClient';

export function getMockedSources() {
  return inventory;
}

export async function postSource(data: Source): Promise<ObjectId> {
  const db = await getDatabase();
  const insertData: OptionalId<Omit<Source, '_id'>> & { _id?: ObjectId } = {
    ...data,
    _id: typeof data._id === 'string' ? new ObjectId(data._id) : data._id
  };
  const result = await db.collection('inventory').insertOne(insertData);
  return result.insertedId as ObjectId;
}

export async function getSources() {
  const db = await getDatabase();
  return await db.collection<Source>('inventory').find().toArray();
}
export async function getSourcesByIds(_ids: string[]) {
  const db = await getDatabase().catch(() => {
    throw new Error("Can't connect to Database");
  });

  const objectIds = _ids.map((id: string) => new ObjectId(id));

  const sources = await db
    .collection<Source>('inventory')
    .find({
      _id: {
        $in: objectIds
      }
    })
    .toArray();

  return sources.sort((a, b) => {
    const findIndex = (id: ObjectId | string) =>
      _ids.findIndex((originalId) =>
        id instanceof ObjectId
          ? id.equals(new ObjectId(originalId))
          : id === originalId
      );

    return findIndex(a._id) - findIndex(b._id);
  });
}

export async function updateSource(source: any) {
  const db = await getDatabase();
  const { _id, ...rest } = source;

  return await db.collection<Source>('inventory').findOneAndReplace(
    { _id: new ObjectId(_id) },
    {
      ...rest
    },
    { returnDocument: 'after' }
  );
}

export async function upsertSource(source: Source) {
  const db = await getDatabase();
  const { _id, ...rest } = source;

  return await db
    .collection<Source>('inventory')
    .findOneAndReplace(
      { _id: new ObjectId(_id) },
      { ...rest },
      { upsert: true, returnDocument: 'after' }
    );
}
