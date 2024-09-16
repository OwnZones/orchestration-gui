import { getSourceThumbnail } from '../../../utils/source';
import EditViewContext from '../EditViewContext';
import GeneralSettings from './GeneralSettings';
import { SourceWithId } from '../../../interfaces/Source';
import UpdateButtons from './UpdateButtons';
import AudioChannels from './AudioChannels/AudioChannels';
import ImageComponent from '../../image/ImageComponent';

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
        close={close}
        removeInventorySource={removeInventorySource}
        source={source}
        isLocked={locked}
      />
    </EditViewContext>
  );
}
