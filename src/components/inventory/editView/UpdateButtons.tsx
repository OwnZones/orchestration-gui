import { Button } from '../../button/Button';
import { useContext } from 'react';
import { EditViewContext } from '../EditViewContext';
import { useTranslate } from '../../../i18n/useTranslate';
import styles from './animation.module.scss';
import { Loader } from '../../loader/Loader';
import { SourceWithId } from '../../../interfaces/Source';
import { IconTrash } from '@tabler/icons-react';

type UpdateButtonsProps = {
  source: SourceWithId;
  removeInventorySource: (source: SourceWithId) => void;
  close: () => void;
  locked: boolean;
};

export default function UpdateButtons({
  source,
  close,
  removeInventorySource,
  locked
}: UpdateButtonsProps) {
  const t = useTranslate();
  const {
    saved: [saved],
    isSame,
    loading
  } = useContext(EditViewContext);

  return (
    <div className="mt-2 flex mb-8 mr-8">
      <div className="flex flex-1 justify-center justify-items-center text-confirm">
        <div className={`opacity-0 ${saved ? styles.opacity : ''}`}>
          {t('saved')}
        </div>
      </div>

      <div className="flex">
        <Button
          type="button"
          state="warning"
          disabled={source.status !== 'gone'}
          className={`${
            source.status !== 'gone'
              ? 'bg-button-delete/50 pointer-events-none'
              : 'bg-button-delete'
          } mr-5 relative flex`}
          onClick={() => removeInventorySource(source)}
        >
          <IconTrash
            className={`${source.status !== 'gone' ? 'text-p/50' : 'text-p'}`}
          />
        </Button>
        <Button state="warning" onClick={close}>
          {t('close')}
        </Button>
        <Button
          className={`${
            locked || isSame
              ? 'bg-button-bg/50 text-button-text/50 pointer-events-none'
              : 'text-button-text bg-button-bg'
          } ml-5 relative flex`}
          type="submit"
          disabled={isSame || locked}
        >
          {loading ? (
            <Loader className="w-10 h-5" />
          ) : (
            <p className="w-10">{t('save')}</p>
          )}
        </Button>
      </div>
    </div>
  );
}
