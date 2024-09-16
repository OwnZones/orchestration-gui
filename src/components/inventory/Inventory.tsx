'use client';

import { useEffect, useState } from 'react';
import { useSources } from '../../hooks/sources/useSources';
import { useSetSourceToPurge } from '../../hooks/sources/useSetSourceToPurge';
import { SourceWithId } from '../../interfaces/Source';
import EditView from './editView/EditView';
import SourceList from '../sourceList/SourceList';
import { useTranslate } from '../../i18n/useTranslate';

export default function Inventory() {
  const [removeInventorySource, reloadList] = useSetSourceToPurge();
  const [updatedSource, setUpdatedSource] = useState<
    SourceWithId | undefined
  >();
  const [sources] = useSources(reloadList, updatedSource);
  const [currentSource, setCurrentSource] = useState<SourceWithId | null>();
  const t = useTranslate();

  useEffect(() => {
    if (updatedSource && typeof updatedSource !== 'boolean') {
      setCurrentSource(updatedSource);
    }
  }, [updatedSource]);

  useEffect(() => {
    if (reloadList) {
      setCurrentSource(null);
    }
  }, [reloadList]);

  const editSource = (source: SourceWithId) => {
    setCurrentSource(source);
  };
  return (
    <div className="flex ">
      <SourceList
        sources={sources}
        action={editSource}
        actionText={t('inventory_list.edit')}
      />
      {currentSource ? (
        <div className={`p-3 ml-2 mt-2 bg-container rounded h-1/2 min-w-max`}>
          <EditView
            source={currentSource}
            updateSource={(source) => setUpdatedSource(source)}
            close={() => setCurrentSource(null)}
            removeInventorySource={removeInventorySource}
          />
        </div>
      ) : null}
    </div>
  );
}
