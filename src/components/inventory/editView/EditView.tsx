import { getSourceThumbnail } from '../../../utils/source';
import EditViewContext from '../EditViewContext';
import GeneralSettings from './GeneralSettings';
import { SourceWithId } from '../../../interfaces/Source';
import UpdateButtons from './UpdateButtons';
import AudioChannels from './AudioChannels/AudioChannels';
import ImageComponent from '../../image/ImageComponent';

export default function EditView({
  source,
  isLocked,
  updateSource,
  close,
  removeInventorySource,
  locked
}: {
  source: SourceWithId;
  isLocked: boolean;
  updateSource: (source: SourceWithId) => void;
  close: () => void;
  removeInventorySource: (source: SourceWithId) => void;
  locked: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = useMemo(() => getSourceThumbnail(source), [source]);

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
        isLocked={isLocked}
        close={close}
        removeInventorySource={removeInventorySource}
        source={source}
        isLocked={locked}
      />
    </EditViewContext>
  );
}
