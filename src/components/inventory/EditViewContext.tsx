'use client';
import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useRef,
  useEffect,
  ReactNode
} from 'react';
import {
  SourceType,
  SourceWithId,
  VideoStream,
  AudioStream,
  Numbers
} from '../../interfaces/Source';
import { API_SECRET_KEY } from '../../utils/constants';
import { zeroBased } from './editView/AudioChannels/utils';

export interface IInput {
  name: string;
  location: string;
  type: SourceType | '';
  lastConnected: Date | '';
  audioMapping?: Numbers[];
}

interface IReadOnlyMetadata {
  ingestServer?: string;
  originalName?: string;
}

interface IContext {
  saved: [boolean | undefined, Dispatch<SetStateAction<boolean | undefined>>];
  loading: boolean;
  input: [IInput, Dispatch<SetStateAction<IInput>>];
  isSame: boolean;
  videoStream: VideoStream;
  audioStream: AudioStream;
  sourceMetadata: IReadOnlyMetadata;
}

export const EditViewContext = createContext<IContext>({
  input: [
    { name: '', location: '', type: '', lastConnected: '', audioMapping: [] },
    () => null
  ],
  saved: [undefined, () => null],
  loading: false,
  isSame: true,
  videoStream: {},
  audioStream: {},
  sourceMetadata: {}
});

export default function Context({
  children,
  source,
  updateSource
}: {
  children: ReactNode;
  source: SourceWithId;
  updateSource: (value: SourceWithId) => void;
}) {
  const formReference = useRef<HTMLFormElement | null>(null);
  const [saved, setSaved] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<IInput>({
    name: source.name,
    location: source.tags.location,
    type: source.type,
    lastConnected: source.lastConnected,
    // audioMapping: source?.stream_settings?.audio_mapping || []
    audioMapping: source?.audio_stream.audio_mapping || []
  });

  useEffect(() => {
    if (
      source.name !== input.name ||
      source.tags.location !== input.location ||
      source.type !== input.type ||
      source?.audio_stream?.audio_mapping
    ) {
      setInput(() => ({
        name: source.name,
        location: source.tags.location,
        type: source.type,
        lastConnected: source.lastConnected,
        // audioMapping: source?.stream_settings?.audio_mapping || []
        audioMapping: source?.audio_stream.audio_mapping || []
      }));
      setSaved(undefined);
    }
  }, [source]);

  const update = () => {
    setLoading(true);
    const updated = { ...source };
    updated.name = input.name;
    updated.tags = {
      ...source.tags,
      location: input.location
    };

    if (input.type) {
      updated.type = input.type;
    }

    if (input.audioMapping) {
      updated.audio_stream.audio_mapping = zeroBased(input.audioMapping);
    }

    fetch('/api/manager/inventory', {
      method: 'POST',
      body: JSON.stringify({
        source: updated
      }),
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    })
      .then((response) => response.json())
      .then(({ source }) => updateSource(source))
      .then(() => {
        setLoading(false);
        setSaved(true);
      });
  };

  const isSame =
    source.name === input.name &&
    source.tags.location === input.location &&
    source.type === input.type &&
    JSON.stringify(source?.audio_stream.audio_mapping) ===
      JSON.stringify(input.audioMapping);

  const videoStream = source.video_stream || {};
  const audioStream = source.audio_stream || {};
  const sourceMetadata = {
    ingestServer: source.ingest_name,
    originalName: source.ingest_source_name
  };

  return (
    <EditViewContext.Provider
      value={{
        input: [input, setInput],
        saved: [saved, setSaved],
        isSame,
        loading,
        videoStream,
        audioStream,
        sourceMetadata
      }}
    >
      <form
        ref={formReference}
        className="flex flex-col min-h-full w-full"
        action=""
        onSubmit={(e) => {
          e.preventDefault();
          update();
        }}
      >
        {children}
      </form>
    </EditViewContext.Provider>
  );
}
