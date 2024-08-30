import { ResourcesIngestResponse } from '../../../../types/ateliere-live';
import { Source } from '../../../interfaces/Source';
import { getIngests, getIngest } from '../../ateliereLive/ingest';
import { upsertSource } from '../sources';
import { getDatabase } from '../../mongoClient/dbClient';
import { WithId } from 'mongodb';

type SourceWithoutLastConnected = Omit<Source, 'lastConnected'>;

async function getSourcesFromAPI(): Promise<SourceWithoutLastConnected[]> {
  const ingests = await getIngests();
  const resolvedIngests = (
    await Promise.allSettled(ingests.map((ingest) => getIngest(ingest.uuid)))
  )
    .filter(
      (result): result is PromiseFulfilledResult<ResourcesIngestResponse> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value);
  const sources: SourceWithoutLastConnected[] = resolvedIngests.flatMap(
    (ingest) => {
      return ingest.sources.map(
        (source) =>
          ({
            status: source.active ? 'new' : 'gone',
            name: source.name,
            type: 'camera',
            tags: {
              location: 'Unknown'
            },
            ingest_name: ingest.name,
            ingest_source_name: source.name,
            ingest_type: source.type,
            video_stream: {
              width: source?.video_stream?.width,
              height: source?.video_stream?.height,
              frame_rate:
                source?.video_stream?.frame_rate_n /
                source?.video_stream?.frame_rate_d
            },
            audio_stream: {
              number_of_channels: source?.audio_stream?.number_of_channels,
              sample_rate: source?.audio_stream?.sample_rate
            },
          createdAt: new Date()
          } satisfies SourceWithoutLastConnected)
      );
    }
  );
  return sources;
}

/**
 * Syncs the inventory with the ingests in Ateliere Live.
 * - Adds new sources to the inventory with the status 'new'
 * - Updates the status of sources depending on wheter or not they are still present in the ingests
 */
export async function runSyncInventory() {
  const db = await getDatabase();
  const apiSources = await getSourcesFromAPI();
  const dbInventory = await db.collection<Source>('inventory').find().toArray();

  const statusUpdateCheck = (
    inventorySource: WithId<Source>,
    apiSource: SourceWithoutLastConnected,
    lastConnected: Date
  ) => {
    const databaseStatus = inventorySource.status;
    const apiStatus = apiSource.status;
    const currentTime = new Date().getTime();
    const lastConnectedTime = new Date(lastConnected).getTime();
    const monthInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    const expiryTime = lastConnectedTime + monthInMilliseconds;

    if (databaseStatus === 'purge' && apiStatus === 'gone') {
      return databaseStatus;
    } else if (apiStatus === 'gone' && currentTime > expiryTime) {
      return 'purge';
    } else {
      return apiStatus;
    }
  };

  // Update status of all sources in the inventory to the status found in API.
  // If a source is not found in the API, it is marked as gone.
  const dbInventoryWithCorrectStatus = dbInventory.map((inventorySource) => {
    const apiSource = apiSources.find((source) => {
      return (
        source.ingest_name === inventorySource.ingest_name &&
        source.ingest_source_name === inventorySource.ingest_source_name &&
        source.ingest_type === inventorySource.type
      );
    });
    if (!apiSource) {
      // If source was not found in response from API, always mark it as gone
      return { ...inventorySource, status: 'gone' } satisfies WithId<Source>;
    }
    const lastConnected =
      apiSource.status !== 'gone' ? new Date() : inventorySource.lastConnected;

    // Keep all old fields from the inventory source (name, tags, id, audio_stream etc), but update the status
    return {
      ...inventorySource,
      status: statusUpdateCheck(inventorySource, apiSource, lastConnected),
      lastConnected: lastConnected
    } satisfies WithId<Source>;
  });

  // Look for new sources that doesn't already exist in the inventory,
  // these should all be added to the inventory, status of these are set in getSourcesFromAPI.
  const newSourcesToUpsert = apiSources
    .filter((source) => {
      const existingSource = dbInventoryWithCorrectStatus.find(
        (inventorySource) => {
          return (
            source.ingest_name === inventorySource.ingest_name &&
            source.ingest_source_name === inventorySource.ingest_source_name &&
            source.ingest_type === inventorySource.ingest_type
          );
        }
      );
      return !existingSource;
    })
    .map((source) => ({ ...source, lastConnected: new Date() }));

  const sourcesToUpsert = [
    ...newSourcesToUpsert,
    ...dbInventoryWithCorrectStatus
  ];

  return await Promise.all(
    sourcesToUpsert.map((source) => {
      return upsertSource(source);
    })
  );
}
