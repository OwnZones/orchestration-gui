import { useEffect, useState } from 'react';
import { MultiviewPreset } from '../interfaces/preset';
import { DataHook } from './types';
import { WithId } from 'mongodb';
import { API_SECRET_KEY } from '../utils/constants';

export function useGetMultiviewPresets() {
  return async (): Promise<MultiviewPreset[]> => {
    const response = await fetch(`/api/manager/multiviews`, {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function useGetMultiviewPreset() {
  return async (id: string): Promise<WithId<MultiviewPreset>> => {
    const response = await fetch(`/api/manager/multiviews/${id}`, {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    });
    if (response.ok) {
      return await response.json();
    }
    throw await response.text();
  };
}

export function useMultiviewPresets(): DataHook<MultiviewPreset[]> {
  const [loading, setLoading] = useState(true);
  const [multiviewPresets, setMultiviewPresets] = useState<MultiviewPreset[]>(
    []
  );

  useEffect(() => {
    setLoading(true);
    fetch('/api/manager/multiviews', {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    })
      .then(async (response) => {
        if (response.ok) {
          setMultiviewPresets(await response.json());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return [multiviewPresets, loading, undefined];
}

export function usePutMultiviewPreset() {
  return async (newMultiviewPreset: MultiviewPreset): Promise<void> => {
    const response = await fetch('/api/manager/presets', {
      method: 'PUT',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify(newMultiviewPreset)
    });
    if (response.ok) {
      return;
    }
    throw await response.text();
  };
}
