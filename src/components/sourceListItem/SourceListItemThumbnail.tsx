import { Source, SourceWithId } from '../../interfaces/Source';
import { getSourceThumbnail } from '../../utils/source';
import Icons from '../icons/Icons';
import ImageComponent from '../image/ImageComponent';

type SourceThumbnailProps = { source: SourceWithId };

export const SourceListItemThumbnail = (props: SourceThumbnailProps) => {
  const { source } = props;

  const getIcon = (source: Source) => {
    const isGone = source.status === 'gone';
    const className = isGone ? 'text-error' : 'text-brand';

    const types = {
      camera: (
        <Icons
          name={isGone ? 'IconVideoOff' : 'IconVideo'}
          className={className}
        />
      ),
      microphone: (
        <Icons
          name={isGone ? 'IconMicrophone2Off' : 'IconMicrophone2'}
          className={className}
        />
      ),
      graphics: (
        <Icons
          name={isGone ? 'IconVectorOff' : 'IconVector'}
          className={className}
        />
      )
    };

    return types[source.type];
  };

  return (
    <div className="w-60 min-h-full flex flex-col items-center justify-around">
      {/* TODO perhaps add alts to translations */}
      <ImageComponent
        src={getSourceThumbnail(source)}
        alt="Source List Thumbnail"
      >
        <div className="absolute top-4 left-4">{getIcon(source)}</div>
      </ImageComponent>
    </div>
  );
};
