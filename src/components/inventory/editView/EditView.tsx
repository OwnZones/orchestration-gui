import Image from 'next/image';
import { getSourceThumbnail } from '../../../utils/source';
import { useMemo, useState } from 'react';
import EditViewContext from '../EditViewContext';
import GeneralSettings from './GeneralSettings';
import { SourceWithId } from '../../../interfaces/Source';
import UpdateButtons from './UpdateButtons';
import AudioChannels from './AudioChannels/AudioChannels';
import { IconExclamationCircle } from '@tabler/icons-react';

type EditViewProps = {
  source: SourceWithId;
  isLocked: boolean;
  updateSource: (source: SourceWithId) => void;
  close: () => void;
  removeInventorySource: (source: SourceWithId) => void;
};

export default function EditView({
  source,
  isLocked,
  updateSource,
  close,
  removeInventorySource
}: EditViewProps) {
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

        <GeneralSettings isLocked={isLocked} />
      </div>

      <div className="flex-auto">
        <AudioChannels source={source} isLocked={isLocked} />
      </div>
      <UpdateButtons
        source={source}
        isLocked={isLocked}
        close={close}
        removeInventorySource={removeInventorySource}
      />
    </EditViewContext>
  );
}
