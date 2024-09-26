'use client';

import { PropsWithChildren, LegacyRef, useEffect, useRef } from 'react';
import { Modal as BaseModal } from '@mui/base';

type BaseModalProps = {
  open: boolean;
  forwardRef?: LegacyRef<HTMLDivElement> | null;
  outsideClick: () => void;
};

export type ModalProps = BaseModalProps & PropsWithChildren;

export function Modal({ open, children, outsideClick }: ModalProps) {
  const element = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (element.current && !element.current.contains(event.target as Node)) {
        outsideClick();
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [outsideClick]);

  return (
    <BaseModal
      className="fixed top-0 left-0 w-full h-full bg-background/30 flex justify-center items-center z-50 overflow-auto"
      open={open}
    >
      <div
        ref={element}
        className="bg-container text-p p-4 shadow-xl rounded m-2"
      >
        {children}
      </div>
    </BaseModal>
  );
}
