'use client'; //nextjs to enable usestate
import React, { useContext, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import { ClickAwayListener } from '@mui/base';
import { SourceWithId } from '../../interfaces/Source';
import { FilterContext } from '../inventory/FilterContext';
import { useResources } from '../../hooks/sources/useResources';

type FilterOptionsProps = {
  onFilteredSources: (sources: Map<string, SourceWithId>) => void;
};

function FilterOptions({ onFilteredSources }: FilterOptionsProps) {
  const { locations, types, sources } = useContext(FilterContext);
  const [resources] = useResources();

  const [onlyShowActiveSources, setOnlyShowActiveSources] = useState(false);
  const [onlyShowNdiSources, setOnlyShowNdiSources] = useState(false);
  const [onlyShowBmdSources, setOnlyShowBmdSources] = useState(false);
  const [onlyShowSrtSources, setOnlyShowSrtSources] = useState(false);
  const [isFilterHidden, setIsFilterHidden] = useState(true);
  const [isTypeHidden, setIsTypeHidden] = useState(true);
  const [isLocationHidden, setIsLocationHidden] = useState(true);
  const [searchString, setSearchString] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set<string>()
  );
  let tempSet = new Map<string, SourceWithId>(sources);

  useEffect(() => {
    if (
      selectedTags.size === 0 &&
      searchString.length === 0 &&
      !onlyShowActiveSources &&
      !onlyShowNdiSources &&
      !onlyShowBmdSources &&
      !onlyShowSrtSources
    ) {
      resetFilter();
      return;
    }

    handleSearch();
    handleTags();
    filterSources();

    onFilteredSources(tempSet);
    tempSet.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchString,
    selectedTags,
    onlyShowActiveSources,
    onlyShowNdiSources,
    onlyShowBmdSources,
    onlyShowSrtSources
  ]);

  const resetFilter = () => {
    tempSet = new Map<string, SourceWithId>(sources);
    onFilteredSources(sources);
  };

  const handleSearch = () => {
    if (searchString.length === 0) {
      tempSet = new Map<string, SourceWithId>(sources);
    } else {
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

  const handleTags = () => {
    if (selectedTags.size !== 0) {
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

  const filterSources = async () => {
    for (const source of tempSet.values()) {
      const correspondingResource = resources.find(
        (resource) => resource.name === source.ingest_source_name
      );

      if (correspondingResource) {
        let shouldDelete = false;
        const isNdiSelected =
          onlyShowNdiSources &&
          correspondingResource.type.toUpperCase() === 'NDI';
        const isBmdSelected =
          onlyShowBmdSources &&
          correspondingResource.type.toUpperCase() === 'BMD';
        const isSrtSelected =
          onlyShowSrtSources &&
          correspondingResource.type.toUpperCase() === 'SRT';

        if (
          (onlyShowNdiSources || onlyShowBmdSources || onlyShowSrtSources) &&
          !isNdiSelected &&
          !isBmdSelected &&
          !isSrtSelected
        ) {
          shouldDelete = true;
        }

        if (onlyShowActiveSources && source.status === 'gone') {
          shouldDelete = true;
        }

        if (shouldDelete) {
          tempSet.delete(source._id.toString());
        }
      }
    }
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
          setOnlyShowNdiSources={setOnlyShowNdiSources}
          setOnlyShowBmdSources={setOnlyShowBmdSources}
          setOnlyShowSrtSources={setOnlyShowSrtSources}
          showBmdType={onlyShowBmdSources}
          showNdiType={onlyShowNdiSources}
          showSrtType={onlyShowSrtSources}
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
