import { useState } from 'react';
import { IconChevronDown, IconCircleMinus } from '@tabler/icons-react';
import Options from './Options';
import { useTranslate } from '../../../i18n/useTranslate';
import Input from './Input';
import { OutputStream } from './ConfigureOutputModal';
type StreamAccordionProps = {
  stream: OutputStream;
  isOnlyStream: boolean;
  update: (key: string, value: string) => void;
  onDelete: () => void;
};

export default function StreamAccordion({
  stream,
  update,
  onDelete,
  isOnlyStream
}: StreamAccordionProps) {
  const [active, setActive] = useState<boolean>(false);
  const t = useTranslate();
  function toggleAccordion() {
    setActive((prevState) => !prevState);
  }

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div className="relative flex flex-col border border-gray-600 rounded w-full shadow-sm mb-2">
      <button
        className={`flex space-x-4 p-2 bg-container items-center rounded`}
        onClick={toggleAccordion}
      >
        <div className="flex flex-1 space-x-4 items-center">
          <div>{stream.name}</div>
        </div>
        <div
          className={`${
            active ? 'transform rotate-180' : 'transform rotate-0'
          }`}
        >
          <IconChevronDown className="w-6 h-6 text-p" />
          {!isOnlyStream && (
            <IconCircleMinus
              onClick={handleDelete}
              className={`absolute ${
                active ? '-left-7 top-5' : '-top-5 left-7'
              } `}
              color="#9ca3af"
            />
          )}
        </div>
      </button>

      <div className={`${active ? 'block' : 'hidden'} w-full`}>
        <div className="bg-container rounded text-p">
          <Options
            label={t('preset.mode')}
            options={['listener', 'caller']}
            value={stream.srtMode}
            update={(value) => update('srtMode', value)}
          />
          <Input
            label={t('preset.port')}
            value={stream.port}
            update={(value) => update('port', value)}
          />
          <Input
            label={t('preset.ip')}
            value={stream.ip}
            update={(value) => update('ip', value)}
          />
          <Input
            label={t('preset.srt_passphrase')}
            value={stream.srtPassphrase}
            update={(value) => update('srtPassphrase', value)}
          />
        </div>
      </div>
    </div>
  );
}
