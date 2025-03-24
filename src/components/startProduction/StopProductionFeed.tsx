import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import { StopProductionStatus } from '../../interfaces/production';
import { useTranslate } from '../../i18n/useTranslate';
import { en } from '../../i18n/locales/en';
import StatusTooltip from '../tooltip/StatusTooltip';
type StopProductionFeedProps = {
  status: StopProductionStatus;
};
export default function StopProductionFeed({
  status
}: StopProductionFeedProps) {
  const t = useTranslate();
  const stopStatus: Record<keyof typeof en.stop_production_status, string> = {
    disconnect_connections: t('stop_production_status.disconnect_connections'),
    remove_pipeline_streams: t(
      'stop_production_status.remove_pipeline_streams'
    ),
    remove_pipeline_multiviews: t(
      'stop_production_status.remove_pipeline_multiviews'
    ),
    reset_pipeline: t('stop_production_status.reset_pipeline'),
    unexpected: t('stop_production_status.unexpected')
  };
  return (
    <div className="flex flex-col mb-4 w-96">
      {status.steps.map((step, i) => {
        return (
          <div key={i} className="flex flex-col items-center justify-center">
            {!step.success ? (
              <div className="flex gap-1 justify-start w-1/2">
                <div className="flex flex-col items-start">
                  <div
                    className={`h-6 w-6 p-1 flex justify-center items-center rounded-full ${
                      step.success ? 'bg-button-bg' : 'bg-button-delete'
                    }`}
                  >
                    {step.success ? <IconCheck /> : <IconX />}
                  </div>
                  {i + 1 < status.steps.length && (
                    <div className="self-center mt-1 mb-1 border-l border-gray-500 h-4"></div>
                  )}
                </div>
                <p className="whitespace-nowrap">{stopStatus[step.step]}</p>

                <StatusTooltip
                  key={i}
                  description={step.message || 'Missing error message'}
                >
                  <IconInfoCircle color="#6b7280" />
                </StatusTooltip>
              </div>
            ) : (
              <div className="flex gap-1 justify-start w-1/2">
                <div className="flex flex-col items-start">
                  <div
                    className={`h-6 w-6 p-1 flex justify-center items-center rounded-full ${
                      step.success ? 'bg-button-bg' : 'bg-button-delete'
                    }`}
                  >
                    {step.success ? <IconCheck /> : <IconX />}
                  </div>
                  {i + 1 < status.steps.length && (
                    <div className="self-center mt-1 mb-1 border-l border-gray-500 h-4"></div>
                  )}
                </div>
                <p className="whitespace-nowrap">{stopStatus[step.step]}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
