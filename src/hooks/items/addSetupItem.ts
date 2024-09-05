import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';

export function addSetupItem(
  source: SourceReference,
  productionSetup: Production
) {
  const multiviews =
    productionSetup.production_settings.pipelines[0].multiviews;
  if (!multiviews || multiviews.length === 0) return;
  const updatedSetup = {
    ...productionSetup,
    sources: [
      ...productionSetup.sources,
      {
        _id: source._id,
        label: source.label,
        stream_uuids: source.stream_uuids,
        input_slot: source.input_slot
      }
    ].sort((a, b) => a.input_slot - b.input_slot)
  };

  return {
    ...updatedSetup,
    sources: [
      ...productionSetup.sources,
      {
        _id: source._id,
        label: source.label,
        stream_uuids: source.stream_uuids,
        input_slot: source.input_slot
      }
    ].sort((a, b) => a.input_slot - b.input_slot)
  };
}
