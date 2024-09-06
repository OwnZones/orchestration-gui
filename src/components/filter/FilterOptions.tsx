'use client'; //nextjs to enable usestate
import React, { useContext, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import { ClickAwayListener } from '@mui/base';
import { SourceWithId } from '../../interfaces/Source';
import { FilterContext } from '../inventory/FilterContext';

type FilterOptionsProps = {
  onFilteredSources: (sources: Map<string, SourceWithId>) => void;
};

function FilterOptions({ onFilteredSources }: FilterOptionsProps) {
  const { locations, types, sources } = useContext(FilterContext);

  const [onlyShowActiveSources, setOnlyShowActiveSources] = useState(false);
  const [showNdiType, setShowNdiType] = useState(true);
  const [showBmdType, setShowBmdType] = useState(true);
  const [showSrtType, setShowSrtType] = useState(true);
  const [showMediaSourceGeneratorType, setShowMediaGeneratorSourceType] =
    useState(false);
  const [isFilterHidden, setIsFilterHidden] = useState(true);
  const [isTypeHidden, setIsTypeHidden] = useState(true);
  const [isLocationHidden, setIsLocationHidden] = useState(true);
  const [searchString, setSearchString] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set<string>()
  );
  const [filteredSources, setFilteredSources] = useState<
    Map<string, SourceWithId>
  >(new Map<string, SourceWithId>());

  useEffect(() => {}, [showMediaSourceGeneratorType]);

  useEffect(() => {
    const tempSet = new Map<string, SourceWithId>(sources);

    if (searchString.length > 0 || selectedTags.size > 0) {
      handleSearch(tempSet);
      handleTags(tempSet);
    }

    filterSources(tempSet);

    setFilteredSources(tempSet);
    onFilteredSources(tempSet);
  }, [
    searchString,
    selectedTags,
    onlyShowActiveSources,
    showNdiType,
    showBmdType,
    showSrtType,
    showMediaSourceGeneratorType,
    sources
  ]);

  const handleSearch = (tempSet: Map<string, SourceWithId>) => {
    if (searchString.length > 0) {
      for (const source of tempSet.values()) {
        const searchValues = [
          source.name,
          source.type,
          source.ingest_name,
          source.tags.location
        ];
        if (
          !searchValues.some((value) =>
            value.toLowerCase().includes(searchString.toLowerCase())
          )
        ) {
          tempSet.delete(source._id.toString());
        }
      }
    }
  };

  const handleTags = (tempSet: Map<string, SourceWithId>) => {
    if (selectedTags.size > 0) {
      const typeTags = new Set<string>();
      const locationTags = new Set<string>();
      selectedTags.forEach((tag) => {
        const itemContent = tag.toLowerCase().split(':');
        if (itemContent[0].includes('type')) {
          typeTags.add(itemContent[1]);
        } else {
          locationTags.add(itemContent[1]);
        }
      });

      for (const source of tempSet.values()) {
        if (itemShouldNotBeShown(typeTags, locationTags, source)) {
          tempSet.delete(source._id.toString());
        }
      }
    }
  };

  const filterSources = (tempSet: Map<string, SourceWithId>) => {
    const isFilteringByType =
      showNdiType || showBmdType || showSrtType || showMediaSourceGeneratorType;

    if (!isFilteringByType) {
      tempSet.clear();
      return;
    }

    for (const source of tempSet.values()) {
      const ingestType = source.ingest_type?.toUpperCase() || '';
      let shouldDelete = true;

      if (
        (showNdiType && ingestType === 'NDI') ||
        (showBmdType && ingestType === 'BMD') ||
        (showSrtType && ingestType === 'SRT') ||
        (showMediaSourceGeneratorType && ingestType === 'MEDIASOURCEGENERATOR')
      ) {
        shouldDelete = false;
      }

      if (onlyShowActiveSources && source.status === 'gone') {
        shouldDelete = true;
      }

      if (shouldDelete) {
        tempSet.delete(source._id.toString());
      }
    }
  };

  const handleSorting = (reversedOrder: boolean) => {
    const sortedSourcesArray = Array.from(filteredSources.values()).sort(
      (a, b) => {
        const dateA = new Date(a.lastConnected).getTime();
        const dateB = new Date(b.lastConnected).getTime();
        return reversedOrder ? dateA - dateB : dateB - dateA;
      }
    );
    const sortedMap = new Map(
      sortedSourcesArray.map((source) => [source._id.toString(), source])
    );
    onFilteredSources(sortedMap);
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        setIsFilterHidden(true);
      }}
    >
      <div className="flex-1">
        <SearchBar
          isFilterHidden={isFilterHidden}
          setIsFilterHidden={setIsFilterHidden}
          setIsTypeHidden={setIsTypeHidden}
          setIsLocationHidden={setIsLocationHidden}
          setSearchString={setSearchString}
        />
        <FilterDropdown
          close={() => setIsFilterHidden(true)}
          types={types}
          locations={locations}
          isFilterHidden={isFilterHidden}
          isLocationHidden={isLocationHidden}
          isTypeHidden={isTypeHidden}
          showConfigSources={onlyShowActiveSources}
          selectedTags={selectedTags}
          setIsTypeHidden={setIsTypeHidden}
          setIsLocationHidden={setIsLocationHidden}
          setSelectedTags={setSelectedTags}
          setOnlyShowActiveSources={setOnlyShowActiveSources}
          setOnlyShowNdiSources={setShowNdiType}
          setOnlyShowBmdSources={setShowBmdType}
          setOnlyShowSrtSources={setShowSrtType}
          setOnlyShowMediaSourceGeneratorSources={
            setShowMediaGeneratorSourceType
          }
          showBmdType={showBmdType}
          showNdiType={showNdiType}
          showSrtType={showSrtType}
          showMediaSourceGeneratorType={showMediaSourceGeneratorType}
          handleSorting={handleSorting}
        />
      </div>
    </ClickAwayListener>
  );
}

function itemShouldNotBeShown(
  typeTags: Set<string>,
  locationTags: Set<string>,
  source: SourceWithId
) {
  return (
    (typeTags.size !== 0 && !typeTags.has(source.type.toLowerCase())) ||
    (locationTags.size !== 0 &&
      !locationTags.has(source.tags.location.toLowerCase()))
  );
}

export default FilterOptions;
