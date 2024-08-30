import Image from 'next/image';
import { getSourceThumbnail } from '../../../utils/source';
import { useMemo, useState } from 'react';
import EditViewContext from '../EditViewContext';
import GeneralSettings from './GeneralSettings';
import { SourceWithId } from '../../../interfaces/Source';
import UpdateButtons from './UpdateButtons';
import AudioChannels from './AudioChannels/AudioChannels';
import { IconExclamationCircle } from '@tabler/icons-react';

export default function EditView({
  source,
  updateSource,
  close,
  removeInventorySource
}: {
  source: SourceWithId;
  updateSource: (source: SourceWithId) => void;
  close: () => void;
  removeInventorySource: (source: SourceWithId) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = useMemo(() => getSourceThumbnail(source), [source]);

  return (
    <EditViewContext source={source} updateSource={updateSource}>
      <div className="flex flex-row">
        {source.status === 'gone' ? (
          <div className="w-96 h-96 flex justify-center items-center p-5">
            <IconExclamationCircle className="text-error w-full h-full" />
          </div>
        ) : (
          <Image
            className={`transition-opacity opacity-0 w-full max-w-lg mb-5 lg:mb-0 ${
              loaded ? 'opacity-100' : ''
            }`}
            alt="Preview Thumbnail"
            src={src}
            onLoadingComplete={() => setLoaded(true)}
            placeholder="empty"
            width={300}
            height={0}
            style={{
              objectFit: 'contain'
            }}
          />
        )}

        <GeneralSettings />
      </div>

      <div className="flex-auto">
        <AudioChannels source={source} />
      </div>
      <UpdateButtons
        close={close}
        removeInventorySource={removeInventorySource}
        source={source}
      />
    </EditViewContext>
  );
}
