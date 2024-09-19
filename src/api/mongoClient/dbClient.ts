import { MongoClient, Db } from 'mongodb';
import {
  defaultMultiview,
  defaultPreset,
  ldOnlyPreset
} from './defaults/preset';
import {
  migrateMultiviewPresets,
  migratePresets,
  migrateProductions
} from './dbMigrate';
import { applyPresetOverrides } from './dbOverrides';
import { defaultFwConfig } from './defaults/fwConfig';
import dotenv from 'dotenv';
import { Log } from '../logger';
dotenv.config();

async function connectToMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid environment variable: "MONGODB_URI"');
  }
  const client: MongoClient = new MongoClient(process.env.MONGODB_URI);
  try {
    const connect = await client.connect();
    return connect;
  } catch (error) {
    throw new Error('Failed to connect to database');
  }
}

async function bootstrapDbCollections(db: Db) {
  try {
    const users = await db.collection('users').countDocuments();
    if (users === 0) {
      Log().info('Bootstrapping database with default user');
      await db.collection('users').insertOne({
        username: 'admin'
      });
    }

    const presets = await db.collection('presets').countDocuments();
    if (presets === 0) {
      Log().info('Bootstrapping database with default presets');
      await db.collection('presets').insertOne(defaultPreset);
      await db.collection('presets').insertOne(ldOnlyPreset);
    } else {
      await migratePresets(db);
    }

    const multiviews = await db.collection('multiviews').countDocuments();
    if (multiviews === 0) {
      Log().info('Bootstrapping database with default multiview');

      await db.collection('multiviews').insertMany(defaultMultiview);
    } else {
      await migrateMultiviewPresets(db);
    }

    if (process.env.DB_OUTPUT_OVERRIDES) {
      Log().info('Applying output preset overrides');
      await applyPresetOverrides(db, process.env.DB_OUTPUT_OVERRIDES);
    }

    const fwConfig = await db.collection('fw_config').countDocuments();
    if (fwConfig === 0) {
      Log().info('Bootstrapping database with default firewall configs');
      await db.collection('fw_config').insertMany(defaultFwConfig);
    }

    const productions = await db.collection('productions').countDocuments();
    if (productions !== 0) {
      await migrateProductions(db);
    }

    return db;
  } catch (error) {
    throw new Error('Failed to connect to collections');
  }
}

let connection_: Promise<MongoClient>;
function getConnection() {
  if (connection_) {
    return connection_;
  }
  connection_ = connectToMongoClient();
  connection_.then(async (connection) => {
    await bootstrapDbCollections(connection.db());
    return connection;
  });

  return connection_;
}

export async function getDatabase() {
  return await getConnection().then((connection) => connection.db());
}

export async function connected() {
  return getDatabase()
    .then((db) => db.command({ connectionStatus: 1 }))
    .then((value) => value && value.ok === 1);
}
