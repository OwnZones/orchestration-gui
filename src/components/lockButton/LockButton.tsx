import { IconLock, IconLockOpen } from '@tabler/icons-react';

type LockButtonProps = {
  isLocked: boolean;
  classNames?: string;
  onClick: () => void;
};

export const LockButton = ({
  isLocked,
  classNames,
  onClick
}: LockButtonProps) => {
  return (
    <button onClick={onClick}>
      {isLocked ? (
        <IconLock className={classNames} color="white" size={36} />
      ) : (
        <IconLockOpen className={classNames} color="white" size={36} />
      )}
    </button>
  );
};
