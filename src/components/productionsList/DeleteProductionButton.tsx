'use client';

import { IconTrash } from '@tabler/icons-react';
import { useDeleteProduction } from '../../hooks/productions';
import { useCallback, useState } from 'react';
import { Loader } from '../loader/Loader';
import { useRouter } from 'next/navigation';
import { DeleteModal } from '../modal/DeleteModal';

type DeleteProductionButtonProps = {
  id: string;
  name: string;
  isActive: boolean;
};

export function DeleteProductionButton({
  id,
  name,
  isActive
}: DeleteProductionButtonProps) {
  const router = useRouter();
  const deleteProduction = useDeleteProduction();

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const onClick = useCallback(() => setModalOpen(true), []);
  const onAbort = useCallback(() => setModalOpen(false), []);
  const onConfirm = useCallback(async () => {
    setModalOpen(false);
    setLoading(true);
    deleteProduction(id)
      .then(() => router.refresh())
      .finally(() => setLoading(false));
  }, [router, deleteProduction, id]);

  return (
    <>
      <button
        className={`${
          isActive
            ? 'bg-gray-400'
            : 'bg-button-delete hover:bg-button-hover-red-bg'
        } p-2 rounded`}
        onClick={onClick}
        disabled={loading || isActive}
      >
        {loading ? (
          <Loader className="w-6 h-6" />
        ) : (
          <IconTrash className="text-p" />
        )}
      </button>
      <DeleteModal
        name={name}
        onAbort={onAbort}
        onConfirm={onConfirm}
        open={modalOpen}
      />
    </>
  );
}
