import { useState } from 'react';
import {
  AddSourceResult,
  DeleteSourceStep,
  SourceWithId
} from '../interfaces/Source';
import { Production } from '../interfaces/production';
import { CallbackHook } from './types';
import { MultiviewSettings } from '../interfaces/multiview';
import { Result } from '../interfaces/result';

export function useCreateStream(): CallbackHook<
  (
    source: SourceWithId,
    production: Production,
    input_slot: number
  ) => Promise<Result<AddSourceResult>>
> {
  const [loading, setLoading] = useState(false);

  const createStream = async (
    source: SourceWithId,
    production: Production,
    input_slot: number
  ): Promise<Result<AddSourceResult>> => {
    setLoading(true);
    const stream = {
      source: source,
      input_slot: input_slot
    };

    return fetch(`/api/manager/streams/`, {
      method: 'POST',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]],
      body: JSON.stringify({ ...stream, production: production })
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        throw await response.text();
      })
      .finally(() => setLoading(false));
  };
  return [createStream, loading];
}

export function useDeleteStream(): CallbackHook<
  (
    streamUuids: string[],
    production: Production,
    input_slot: number
  ) => Promise<Result<DeleteSourceStep[]>>
> {
  const [loading, setLoading] = useState(false);
  const deleteStream = async (
    streamUuids: string[],
    production: Production,
    input_slot: number
  ): Promise<Result<DeleteSourceStep[]>> => {
    setLoading(true);

    const pipelineUUID =
      production.production_settings.pipelines[0].pipeline_id;

    const multiviews = production.production_settings.pipelines[0].multiview;
    const multiviewViews = multiviews?.flatMap((singleMultiview) => {
      return singleMultiview.layout.views;
    });
    const multiviewsToUpdate = multiviewViews?.filter(
      (v) => v.input_slot === input_slot
    );

    if (!multiviewsToUpdate || multiviewsToUpdate.length === 0) {
      const streamRequests = streamUuids.map((streamUuid) => {
        return fetch(`/api/manager/streams/${streamUuid}`, {
          method: 'DELETE',
          // TODO: Implement api key
          headers: [['x-api-key', `Bearer apisecretkey`]],
          body: JSON.stringify({
            pipelineUUID: pipelineUUID
          })
        });
      });
      const result = await Promise.all(streamRequests);
      const promises = result.map(async (r) => {
        return (await r.json()) as Result<DeleteSourceStep[]>;
      });
      const data = await Promise.all(promises);
      const failed = data.find((data) => !data.ok);
      if (failed) {
        setLoading(false);
        return failed;
      }
      setLoading(false);
      const ok = data.find((data) => data.ok);
      if (ok) {
        return ok;
      }
      return {
        ok: false,
        error: 'unexpected'
      };
    }

    const updatedMultiviews = multiviewsToUpdate?.map((view) => {
      return {
        ...view,
        label: view.label
      };
    });

    const rest = multiviewViews?.filter((v) => v.input_slot !== input_slot);

    const restWithLabels = rest?.map((v) => {
      const sourceForView = production.sources.find(
        (s) => s.input_slot === v.input_slot
      );

      if (sourceForView) {
        return { ...v, label: sourceForView.label };
      }

      return v;
    });

    if (
      !restWithLabels ||
      !updatedMultiviews ||
      updatedMultiviews.length === 0 ||
      !multiviews?.some((singleMultiview) => singleMultiview.layout)
    ) {
      setLoading(false);
      return {
        ok: false,
        error: 'unexpected'
      };
    }

    const multiviewsWithLabels = [...restWithLabels, ...updatedMultiviews];

    const multiview: MultiviewSettings[] = multiviews.map(
      (singleMultiview, index) => ({
        ...singleMultiview,
        layout: {
          ...singleMultiview.layout,
          views: multiviewsWithLabels
        },
        for_pipeline_idx: index,
        multiviewId: index + 1
      })
    );

    const streamRequests = streamUuids.map((streamUuid) => {
      return fetch(`/api/manager/streams/${streamUuid}`, {
        method: 'DELETE',
        // TODO: Implement api key
        headers: [['x-api-key', `Bearer apisecretkey`]],
        body: JSON.stringify({
          multiview: multiview,
          pipelineUUID: pipelineUUID
        })
      });
    });
    const result = await Promise.all(streamRequests);
    const promises = result.map(async (r) => {
      return (await r.json()) as Result<DeleteSourceStep[]>;
    });
    const data = await Promise.all(promises);
    const failed = data.find((data) => !data.ok);
    if (failed) {
      setLoading(false);
      return failed;
    }
    setLoading(false);
    const ok = data.find((data) => data.ok);
    if (ok) {
      return ok;
    }
    return {
      ok: false,
      error: 'unexpected'
    };
  };
  return [deleteStream, loading];
}
