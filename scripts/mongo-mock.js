/* eslint-disable no-undef */
const liveDb = db.getSiblingDB('live-gui');

function createSource(
  name,
  location,
  type,
  ingest_name,
  ingest_source_name,
  audioStream,
  videoStream
) {
  /**
   * @type {import("../src/interfaces/Source.ts").Source}
   */
  const source = {
    name,
    type,
    tags: {
      location
    },
    ingest_name,
    ingest_source_name,
    _id: new ObjectId()
  };
  if (videoStream) {
    source.video_stream = videoStream;
  }

  if (audioStream) {
    source.audio_stream = audioStream;
  }

  return source;
}

const videoStream = {
  width: 1920,
  height: 1080,
  frame_rate: 50
};

const audioStream = {
  number_of_channels: 2,
  sample_rate: 48000
};

const sources = [
  createSource(
    'input-1',
    'stockholm',
    'camera',
    'mock-backend-sto-ingest',
    'input-1',
    audioStream,
    videoStream
  ),
  createSource(
    'input-2',
    'stockholm',
    'camera',
    'mock-backend-sto-ingest',
    'input-2',
    audioStream,
    videoStream
  ),
  createSource(
    'input-3',
    'stockholm',
    'camera',
    'mock-backend-sto-ingest',
    'input-3',
    audioStream,
    videoStream
  ),
  createSource(
    'input-4',
    'stockholm',
    'microphone',
    'mock-backend-sto-ingest',
    'input-4',
    audioStream
  ),
  createSource(
    'input-5',
    'stockholm',
    'microphone',
    'mock-backend-sto-ingest',
    'input-5',
    audioStream
  ),
  createSource(
    'input-6',
    'stockholm',
    'microphone',
    'mock-backend-sto-ingest',
    'input-6',
    audioStream
  ),
  createSource(
    'input-1',
    'umeå',
    'camera',
    'mock-backend-ume-ingest',
    'input-1',
    audioStream,
    videoStream
  ),
  createSource(
    'input-1',
    'umeå',
    'microphone',
    'mock-backend-ume-ingest',
    'input-1',
    audioStream
  )
];

liveDb.inventory.insertMany(sources);

liveDb.users.insertOne({
  username: 'admin'
});

liveDb.productions.insertOne({
  name: 'stockholm_podcast',
  sources,
  selectedPresetRef: undefined
});

liveDb.productions.insertOne({
  name: 'umeå_podcast',
  sources: [sources[6], sources[7]],
  selectedPresetRef: undefined
});

liveDb.productions.insertOne({
  name: 'Svenska Nyheter',
  sources: [sources[0], sources[1], sources[2], sources[3]],
  selectedPresetRef: undefined
});

liveDb.productions.insertOne({
  name: 'Morgon Studion',
  sources: [sources[0], sources[3]],
  selectedPresetRef: undefined
});
