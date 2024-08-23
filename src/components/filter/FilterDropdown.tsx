import React, { ChangeEvent, useEffect, useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';

function FilterDropdown({
  close,
  types,
  locations,
  isFilterHidden,
  isTypeHidden,
  isLocationHidden,
  showConfigSources,
  selectedTags,
  showConfigNdiType,
  showConfigBmdType,
  showConfigSrtType,
  setIsTypeHidden,
  setIsLocationHidden,
  setSelectedTags,
  setOnlyShowActiveSources: setOnlyShowConfigSources,
  setOnlyShowNdiSources: setOnlyShowNdiSources,
  setOnlyShowBmdSources: setOnlyShowBmdSources,
  setOnlyShowSrtSources: setOnlyShowSrtSources
}: {
  close: () => void;
  types: string[];
  locations: string[];
  isFilterHidden: boolean;
  isTypeHidden: boolean;
  isLocationHidden: boolean;
  showConfigSources: boolean;
  selectedTags: Set<string>;
  showConfigNdiType: boolean;
  showConfigSrtType: boolean;
  showConfigBmdType: boolean;
  setIsTypeHidden: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLocationHidden: React.Dispatch<React.SetStateAction<boolean>>;
  setOnlyShowActiveSources: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  setOnlyShowNdiSources: React.Dispatch<React.SetStateAction<boolean>>;
  setOnlyShowBmdSources: React.Dispatch<React.SetStateAction<boolean>>;
  setOnlyShowSrtSources: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [searchedTypes, setSearchedTypes] = useState<string[]>([]);
  const [searchedLocations, setSearchedLocations] = useState<string[]>([]);

  useEffect(() => {
    setSearchedTypes(types);
    setSearchedLocations(locations);
  }, [types, locations]);

  const hideLocationDiv = () => {
    setIsLocationHidden(true);
  };

  const hideTypeDiv = () => {
    setIsTypeHidden(true);
  };

  const showSelectedConfigSources = () => {
    setOnlyShowConfigSources(!showConfigSources);
  };

  const showSelectedConfigNdiType = () => {
    setOnlyShowNdiSources(!showConfigNdiType);
  };

  const showSelectedConfigBmdType = () => {
    setOnlyShowBmdSources(!showConfigBmdType);
  };

  const showSelectedConfigSrtType = () => {
    setOnlyShowSrtSources(!showConfigSrtType);
  };

  const deleteTag = (value: string) => {
    const temp = selectedTags;
    temp.delete(value);
    setSelectedTags(new Set<string>(temp));
  };

  function addFilterComponent(type: string, component: string, index: number) {
    const id = `${type}-${component}-id`;
    const key = `${type}-${index}`;
    return (
      <li
        key={key}
        className="flex rounded-lg px-3 py-1 hover:bg-gray-600"
        onClick={() => {
          const temp = Array.from(selectedTags);
          temp.push(`${type}:${component}`);
          setSelectedTags(new Set<string>(temp));
        }}
      >
        <div className="flex items-center p-2 rounded hover:bg-gray-600">
          <div
            id={id}
            className="w-4 h-4 text-zinc-600 focus:ring-zinc-600 ring-offset-gray-700 focus:ring-offset-gray-700 focus:ring-2 bg-zinc-600 border-gray-500"
          />
          <label htmlFor={id} className="w-full ml-2 text-sm font-medium">
            {component.replace(component[0], component[0].toUpperCase())}
          </label>
        </div>
      </li>
    );
  }

  const addEnabledTags = (tag: string, index: number) => {
    return (
      <button
        key={`${tag}-${index}`}
        id={`${tag}-id`}
        className="flex text-sm rounded-lg border justify-center pl-2 pr-2 hover:line-through decoration-black decoration-2 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
        onClick={() => {
          deleteTag(tag);
        }}
      >
        {tag.split(':')[1]}
      </button>
    );
  };

  const handleClear = () => {
    setSelectedTags(new Set<string>());
    setOnlyShowConfigSources(false);
  };

  const typesSearch = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length < 1) {
      setSearchedTypes(types);
      return;
    }
    const temp = searchedTypes.filter((item) =>
      item.toLowerCase().includes(event.currentTarget.value)
    );
    setSearchedTypes(temp);
  };

  const locationsSearch = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length < 1) {
      setSearchedLocations(locations);
      return;
    }
    const temp = searchedLocations.filter((item) =>
      item.toLowerCase().includes(event.currentTarget.value)
    );
    setSearchedLocations(temp);
  };

  const t = useTranslate();
  return (
    <div
      id="dropdownDefaultCheckbox"
      className={`relative ${
        !isFilterHidden ? 'min-h-fit max-h-[100rem]' : 'overflow-hidden max-h-0'
      } transition-all duration-150 ease items-center mt-1 z-20 divide-y rounded-lg shadow bg-zinc-700 divide-gray-600 dropend`}
    >
      <ul
        className="flex flex-col px-3 pb-3 text-sm text-p"
        id="checkbox-container"
        aria-labelledby="dropdownCheckboxButton"
      >
        <li
          className="rounded mt-4 p-2 relative px-3 py-1"
          onMouseLeave={hideTypeDiv}
        >
          <div className="flex items-center" id="typesBody">
            <span className="flex min-w-[20%] mr-5">
              {t('inventory_list.types')}
            </span>
            <input
              type="search"
              id="searchTypes"
              name="searchTypes"
              className="border justify-center text-sm rounded-lg w-full pl-2 pt-1 pb-1 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('inventory_list.filter', {
                type: t('inventory_list.types')
              })}
              onClick={() => setIsTypeHidden(false)}
              onChange={typesSearch}
              autoComplete="off"
            />
          </div>
          <div className="grid grid-flow-row gap-1 col-span-1 grid-cols-2 mt-2 z-20  divide-y rounded-lg bg-zinc-700 divide-gray-600">
            {Array.from(selectedTags)
              .filter((tag) => tag.includes('type'))
              .map((tag, index) => {
                return addEnabledTags(tag, index);
              })}
          </div>
          <div
            className="absolute border w-full z-50 rounded-lg shadow  divide-y bg-zinc-700 divide-gray-600"
            hidden={isTypeHidden}
          >
            <ul className="px-3 pb-3 text-sm text-p">
              {searchedTypes.map((item, index) => {
                return addFilterComponent('type', item, index);
              })}
            </ul>
          </div>
        </li>
        <li
          className="rounded p-2 relative px-3 py-1"
          onMouseLeave={hideLocationDiv}
        >
          <div className="flex items-center" id="locationsBody">
            <span className="flex min-w-[20%] mr-5">
              {t('inventory_list.locations')}
            </span>
            <input
              type="search"
              id="searchLocations"
              name="searchLocations"
              className="border justify-center text-sm rounded-lg w-full pl-2 pt-1 pb-1 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('inventory_list.filter', {
                type: t('inventory_list.locations')
              })}
              onClick={() => {
                setIsLocationHidden(false);
                setSearchedLocations(locations);
              }}
              onChange={locationsSearch}
              autoComplete="off"
            />
          </div>
          <div className="grid grid-flow-row gap-1 col-span-1 grid-cols-2 mt-2 z-20 divide-y rounded-lg bg-zinc-700 divide-gray-600">
            {Array.from(selectedTags)
              .filter((tag) => tag.includes('location'))
              .map((tag, index) => {
                return addEnabledTags(tag, index);
              })}
          </div>
          <div
            className="absolute border w-full z-20 rounded-lg shadow  divide-y bg-zinc-700 divide-gray-600"
            hidden={isLocationHidden}
          >
            <ul className="px-3 pb-3 text-sm text-p">
              {searchedLocations.map((item, index) => {
                return addFilterComponent('location', item, index);
              })}
            </ul>
          </div>
        </li>
        <li className="relative rounded w-full px-3">
          <div className="flex flex-row justify-between mt-4">
            <div className="flex flex-row">
              <input
                id="showSelectedCheckbox"
                type="checkbox"
                className="flex ml-2 w-4 justify-center rounded-lg text-zinc-300"
                checked={showConfigSources}
                onChange={showSelectedConfigSources}
              />
              <label
                className="ml-2 mt-1 text-left text-zinc-300"
                htmlFor="showSelectedCheckbox"
              >
                {t('inventory_list.active_sources')}
              </label>
            </div>
            <div className="flex flex-row">
              <input
                id="showNdiCheckbox"
                type="checkbox"
                className="flex ml-2 w-4 justify-center rounded-lg text-zinc-300"
                checked={showConfigNdiType}
                onChange={showSelectedConfigNdiType}
              />
              <label
                className="ml-2 mt-1 text-left text-zinc-300"
                htmlFor="showNdiCheckbox"
              >
                NDI
              </label>
            </div>
            <div className="flex flex-row">
              <input
                id="showSelectedCheckbox"
                type="checkbox"
                className="flex ml-2 w-4 justify-center rounded-lg text-zinc-300"
                checked={showConfigSrtType}
                onChange={showSelectedConfigSrtType}
              />
              <label
                className="ml-2 mt-1 text-left text-zinc-300"
                htmlFor="showSelectedCheckbox"
              >
                SRT
              </label>
            </div>
            <div className="flex flex-row">
              <input
                id="showSelectedCheckbox"
                type="checkbox"
                className="flex ml-2 w-4 justify-center rounded-lg text-zinc-300"
                checked={showConfigBmdType}
                onChange={showSelectedConfigBmdType}
              />
              <label
                className="ml-2 mt-1 text-left text-zinc-300"
                htmlFor="showSelectedCheckbox"
              >
                SDI/HTML
              </label>
            </div>
          </div>
          <div className="flex self-end justify-end mt-4">
            <button
              onClick={handleClear}
              id="dropdownCheckboxButton"
              className="flex ml-2 mb-2 min-w-[30%] justify-center font-medium rounded-lg py-2.5 text-zinc-300 bg-zinc-800  hover:ring-2 focus:outline-none bg-zink-800 hover:bg-zinc-700 opacity-70"
              type="button"
            >
              {t('clear')}
            </button>
            <button
              onClick={() => close()}
              className="flex ml-2 mb-2 min-w-[30%] justify-center font-medium rounded-lg py-2.5 text-zinc-300 bg-zinc-800  hover:ring-2 focus:outline-none bg-zink-800 hover:bg-zinc-700"
              type="button"
            >
              {t('apply')}
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default FilterDropdown;
