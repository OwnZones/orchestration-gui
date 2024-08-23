'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Source, Type } from '../../interfaces/Source';
import { IconExclamationCircle } from '@tabler/icons-react';

type SourceThumbnailProps = {
  source?: Source;
  src?: string;
  type?: Type;
};

export function SourceThumbnail({ source, src, type }: SourceThumbnailProps) {
  const [loaded, setLoaded] = useState(false);

  if (source && source.status === 'gone') {
    return (
      <div className="w-full h-full flex justify-center items-center p-5">
        <IconExclamationCircle className="text-error w-full h-full" />
      </div>
    );
  }

  return (
    <>
      {(type === 'ingest_source' || !type) && src && (
        <Image
          className={`transition-opacity opacity-0 ${
            loaded ? 'opacity-100' : ''
          }`}
          alt="Preview Thumbnail"
          src={src}
          onLoadingComplete={() => setLoaded(true)}
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
      )}
      {(type === 'html' || type === 'mediaplayer') && (
        <span
          className={`${
            type === 'html' ? 'bg-sky-600' : 'bg-green-600'
          } flex justify-center items-center w-full h-full`}
        >
          <p className="text-black text-xl">
            {type === 'html' ? 'HTML' : 'Media Player'}
          </p>
        </span>
      )}
    </>
  );
}
