'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { SourceWithId } from '../interfaces/Source';

interface IContext {
  locations: string[];
  types: string[];
  sources: Map<string, SourceWithId>;
}

export const FilterContext = createContext<IContext>({
  locations: [],
  types: [],
  sources: new Map<string, SourceWithId>()
});

export default function Context({
  sources,
  children
}: {
  sources: Map<string, SourceWithId>;
  children: ReactNode;
}) {
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const temp: { location: Set<string>; type: Set<string> } = {
      location: new Set<string>(),
      type: new Set<string>()
    };

    for (const source of sources.values()) {
      if (source.tags.location)
        temp.location.add(source.tags.location.toLowerCase());
      if (source.type) temp.type.add(source.type.toLowerCase());
    }
    setLocations(Array.from(temp.location));
    setTypes(Array.from(temp.type));
  }, [sources]);

  return (
    <FilterContext.Provider
      value={{
        locations,
        types,
        sources
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
