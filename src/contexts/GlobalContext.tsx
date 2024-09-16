'use client';

import { createContext, useState, PropsWithChildren } from 'react';

interface IGlobalContext {
  locked: boolean;
  imageRefetchIndex: number;
  incrementImageRefetchIndex: () => void;
  toggleLocked: () => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  locked: false,
  imageRefetchIndex: 0,
  incrementImageRefetchIndex: () => {
    // outsmarting lint
  },
  toggleLocked: () => {
    // outsmarting lint
  }
});

const GlobalContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [locked, setLocked] = useState<boolean>(true);
  const [imageRefetchIndex, setImageRefetchIndex] = useState<number>(0);

  const incrementImageRefetchIndex = () => {
    setImageRefetchIndex(imageRefetchIndex + 1);
  };

  const toggleLocked = () => {
    setLocked(!locked);
  };

  return (
    <GlobalContext.Provider
      value={{
        locked,
        imageRefetchIndex,
        incrementImageRefetchIndex,
        toggleLocked
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
