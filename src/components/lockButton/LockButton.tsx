import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { useContext } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';

type LockButtonProps = {
  classNames?: string;
};

export const LockButton = ({ classNames }: LockButtonProps) => {
  const { locked, toggleLocked } = useContext(GlobalContext);

  return (
    <button onClick={toggleLocked}>
      {locked ? (
        <IconLock className={classNames} color="white" size={36} />
      ) : (
        <IconLockOpen className={classNames} color="white" size={36} />
      )}
    </button>
  );
};
