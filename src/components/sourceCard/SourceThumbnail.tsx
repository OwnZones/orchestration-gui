'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Source } from '../../interfaces/Source';
import { IconExclamationCircle } from '@tabler/icons-react';

type SourceThumbnailProps = {
  source: Source;
  src: string;
};

export function SourceThumbnail({ source, src }: SourceThumbnailProps) {
  const [loaded, setLoaded] = useState(false);

  if (source.status === 'gone') {
    return (
      <div className="w-full h-full flex justify-center items-center p-5">
        <IconExclamationCircle className="text-error w-full h-full" />
      </div>
    );
  }

  return (
    <Image
      className={`transition-opacity opacity-0 ${loaded ? 'opacity-100' : ''}`}
      alt="Preview Thumbnail"
      src={src}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      placeholder="empty"
      width={0}
      height={0}
      sizes="20vh"
      style={{
        width: 'auto',
        height: '100%'
      }}
    />
  );
}
