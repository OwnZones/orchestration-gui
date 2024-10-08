import { ObjectId } from 'mongodb';
import { Production } from '../interfaces/production';

export function usePostProduction() {
  return async (name: string): Promise<ObjectId> => {
    const response = await fetch('/api/manager/productions', {
      method: 'POST',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]],
      body: JSON.stringify({
        isActive: false,
        name,
        sources: []
      })
    });
    if (response.ok) {
      return await response.json();
    }
    throw await response.text();
  };
}

export function useGetProduction() {
  return async (id: string): Promise<Production> => {
    const response = await fetch(`/api/manager/productions/${id}`, {
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

export function usePutProduction() {
  return async (id: string, production: Production): Promise<Production> => {
    const response = await fetch(`/api/manager/productions/${id}`, {
      method: 'PUT',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]],
      body: JSON.stringify(production)
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function useDeleteProduction() {
  return async (id: string): Promise<void> => {
    const response = await fetch(`/api/manager/productions/${id}`, {
      method: 'DELETE',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    });
    if (response.ok) {
      return;
    }
    throw await response.text();
  };
}
