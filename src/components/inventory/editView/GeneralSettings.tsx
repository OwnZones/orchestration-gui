import { useContext } from 'react';
import { EditViewContext, IInput } from '../EditViewContext';
import { FilterContext } from '../../../contexts/FilterContext';
import { useTranslate } from '../../../i18n/useTranslate';
import SelectOptions from './SelectOptions';
import { getHertz } from '../../../utils/stream';
import videoSettings from '../../../utils/videoSettings';

type GeneralSettingsProps = {
  locked: boolean;
};

export default function GeneralSettings({ locked }: GeneralSettingsProps) {
  const {
    input: [input, setInput],
    saved: [saved, setSaved],
    videoStream,
    audioStream,
    sourceMetadata
  } = useContext(EditViewContext);

  const t = useTranslate();
  const { locations, types } = useContext(FilterContext);

  type TKey = 'name' | 'location' | 'type';

  const onChange = (key: TKey, value: string) => {
    if (saved) setSaved(false);

    setInput((state: IInput) => ({
      ...state,
      [key]: value
    }));
  };

  const { height, width, frame_rate: frameRate } = videoStream;
  const { sample_rate: sampleRate } = audioStream;
  const { ingestServer, originalName } = sourceMetadata;

  return (
    <div className="text-sm text-p lg:ml-5 w-96">
      <div className="flex mb-5">
        <h2 className="flex w-[100px] items-center">{t('name')}</h2>
        <input
          type="text"
          value={input.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={`${
            locked
              ? 'pointer-events-none bg-gray-700/50 border-gray-600/50 placeholder-gray-400/50 text-p/50'
              : 'pointer-events-auto bg-gray-700 border-gray-600 placeholder-gray-400 text-p'
          } 'cursor-pointer ml-5 border justify-center text-sm rounded-lg w-full pl-2 pt-1 pb-1 focus:ring-blue-500 focus:border-blue-500'`}
          disabled={locked}
        />
      </div>

      <div className="flex mb-5">
        <SelectOptions
          name="type"
          options={types}
          selected={input.type}
          disabled={locked}
          onChange={(e) => onChange('type', e.target.value.toLowerCase())}
        />
      </div>
      <div className="flex mb-5">
        <SelectOptions
          name="location"
          options={locations}
          selected={input.location}
          disabled={locked}
          onChange={(e) => onChange('location', e.target.value.toLowerCase())}
        />
      </div>

      <div className="flex mb-5">
        <h2 className="flex w-[100px] items-center">{t('source.metadata')}</h2>
        <div className="flex-col">
          <p>{t('source.ingest', { ingest: ingestServer || '' })}</p>
          <p>{t('source.orig', { name: originalName || '' })}</p>
        </div>
      </div>

      <div className="flex mb-5">
        <h2 className="flex w-[100px] items-center">
          {t('source.last_connected')}
        </h2>
        <div className="flex-col">
          <p>{new Date(input.lastConnected).toLocaleString()}</p>
        </div>
      </div>

      {height && width && (
        <div className="flex mb-5">
          <h2 className="flex w-[100px] items-center">{t('video')}</h2>
          <h2>{videoSettings(width, height, frameRate)}</h2>
        </div>
      )}

      {sampleRate && (
        <div className="flex mb-5">
          <h2 className="flex w-[100px] items-center">{t('audio')}</h2>
          <h2>{getHertz(sampleRate)}</h2>
        </div>
      )}
    </div>
  );
}
