import { getSourceThumbnail } from '../../../utils/source';
import EditViewContext from '../EditViewContext';
import GeneralSettings from './GeneralSettings';
import { SourceWithId } from '../../../interfaces/Source';
import UpdateButtons from './UpdateButtons';
import AudioChannels from './AudioChannels/AudioChannels';
import ImageComponent from '../../image/ImageComponent';
import { useContext } from 'react';
import { GlobalContext } from '../../../contexts/GlobalContext';

export default function EditView({
  source,
  updateSource,
  close,
  removeInventorySource,
  locked
}: {
  source: SourceWithId;
  updateSource: (source: SourceWithId) => void;
  close: () => void;
  removeInventorySource: (source: SourceWithId) => void;
  locked: boolean;
}) {
  console.log('LOCKED THREE: ', locked);

  return (
    <EditViewContext source={source} updateSource={updateSource}>
      <div className="flex flex-row mb-10 h-[22rem]">
        <div className="relative w-[38rem]">
          <ImageComponent src={getSourceThumbnail(source)} />
        </div>
        <GeneralSettings locked={locked} />
      </div>

      <div className="flex-auto">
        <AudioChannels source={source} locked={locked} />
      </div>
      <UpdateButtons
        source={source}
        close={close}
        removeInventorySource={removeInventorySource}
        locked={locked}
      />
    </EditViewContext>
  );
}
