import { SourceReference } from '../../../interfaces/Source';
import {
  MultiviewSettings,
  MultiviewViews
} from '../../../interfaces/multiview';
import { Log } from '../../logger';

export function createMultiview(
  sources: SourceReference[],
  multiviewPreset?: MultiviewSettings
) {
  if (!multiviewPreset) {
    Log().error('Aborted multiview creation due to missing multiview settings');
    throw 'Aborted multiview creation due to missing multiview settings';
  }
  const multiview = structuredClone(multiviewPreset);
  multiview.layout.views.forEach((view: MultiviewViews) => {
    const labelForView = sources.find(
      (source) => source.input_slot === view.input_slot
    )?.label;
    if (!labelForView) {
      Log().info(
        `Did not find corresponding label for view on input slot: ${view.input_slot}. Using preset label instead`
      );
    } else {
      view.label = labelForView;
    }
  });
  return multiview;
}
