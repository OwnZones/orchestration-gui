import { useTranslate } from '../../i18n/useTranslate';
import { AddSourceStatus } from '../../interfaces/Source';
import { Button } from '../button/Button';
import { Loader } from '../loader/Loader';
import AddSourceFeed from '../startProduction/AddSourceFeed';
import { Modal } from './Modal';

type AddSourceModalProps = {
  name: string;
  open: boolean;
  onAbort: () => void;
  onConfirm: () => void;
  status?: AddSourceStatus;
  loading: boolean;
};

export function AddSourceModal({
  name,
  open,
  onAbort,
  onConfirm,
  status,
  loading
}: AddSourceModalProps) {
  const t = useTranslate();
  return (
    <Modal open={open} outsideClick={onAbort}>
      <div className="text-center flex flex-col items-center">
        <p>HEJ</p>
        <h1 className="text-xl">{t('workflow.add_source_modal', { name })}</h1>
        <div>{status && <AddSourceFeed status={status} />}</div>
        <div className="flex gap-8 mt-4">
          <Button
            onClick={onAbort}
            className="bg-button-delete hover:bg-button-hover-red-bg"
          >
            {t('abort')}
          </Button>

          <Button onClick={onConfirm} className={'min-w-fit'}>
            {loading ? (
              <Loader className="w-10 h-5" />
            ) : (
              t('workflow.add_source')
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
