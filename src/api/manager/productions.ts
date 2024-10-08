import { Db, ObjectId, UpdateResult } from 'mongodb';
import { getDatabase } from '../mongoClient/dbClient';
import { Production, ProductionWithId } from '../../interfaces/production';
import { Log } from '../logger';

export async function getProductions(): Promise<Production[]> {
  const db = await getDatabase();
  return (await db.collection('productions').find({}).toArray()).map(
    (prod) => ({ ...prod, _id: prod._id.toString() })
  ) as Production[];
}

export async function getProduction(id: string): Promise<ProductionWithId> {
  const db = await getDatabase();

  return (await db
    .collection('productions')
    .findOne({ _id: new ObjectId(id) })) as ProductionWithId;
}
export async function setProductionsIsActiveFalse(): Promise<
  UpdateResult<Document>
> {
  const db = await getDatabase();
  return await db
    .collection('productions')
    .updateMany({}, { $set: { isActive: false } });
}
export async function putProduction(
  id: string,
  production: Production
): Promise<Production> {
  const db = await getDatabase();
  const newSourceId = new ObjectId().toString();

  const sources = production.sources
    ? production.sources.flatMap((singleSource) => {
        return singleSource._id
          ? singleSource
          : {
              _id: newSourceId,
              type: singleSource.type,
              label: singleSource.label,
              input_slot: singleSource.input_slot
            };
      })
    : [];

  await db.collection('productions').findOneAndReplace(
    { _id: new ObjectId(id) },
    {
      name: production.name,
      isActive: production.isActive,
      sources: sources,
      production_settings: production.production_settings
    }
  );

  if (!production.isActive) {
    deleteMonitoring(db, id);
  }

  return {
    _id: new ObjectId(id).toString(),
    name: production.name,
    isActive: production.isActive,
    sources: sources,
    production_settings: production.production_settings
  };
}

export async function postProduction(data: Production): Promise<ObjectId> {
  const db = await getDatabase();
  return (
    await db
      .collection('productions')
      .insertOne({ ...data, _id: new ObjectId(data._id) })
  ).insertedId;
}

export async function deleteProduction(id: string): Promise<void> {
  const db = await getDatabase();

  await db.collection('productions').deleteOne({
    _id: { $eq: new ObjectId(id) }
  });
  Log().info('Deleted production', id);

  deleteMonitoring(db, id);
}

function deleteMonitoring(db: Db, productionId: string) {
  db.collection('monitoring').deleteMany({ productionId: productionId });
}
