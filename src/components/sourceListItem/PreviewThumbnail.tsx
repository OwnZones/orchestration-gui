import Image from 'next/image';
import { useState } from 'react';

type PreviewProps = { src: string };

export const PreviewThumbnail = ({ src }: PreviewProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`absolute transition-opacity opacity-0 ${
        loaded ? 'opacity-100' : ''
      } 
        -top-8 to left-0 z-50 aspect-video m-2 overflow-hidden min-w-[60%] max-w-[60%] border rounded-lg bg-zinc-500`}
    >
      <Image
        alt="Preview Thumbnail"
        src={src}
        onLoad={() => setLoaded(true)}
        placeholder="empty"
        width={0}
        height={0}
        sizes="20vh"
        style={{
          width: 'auto',
          height: '100%'
        }}
      />
    </div>
  );
};
