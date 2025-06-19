import { useState } from 'react';
import { useTeardown } from '../../hooks/workflow';
import { useTranslate } from '../../i18n/useTranslate';
import { SideNavItemBaseProps } from './SideNav';
import SideNavTooltip from './SideNavTooltip';
import { Modal } from '../modal/Modal';
import { Button } from '../button/Button';
import { FlowStep, TeardownStepNames } from '../../interfaces/production';
import { Loader } from '../loader/Loader';
import FlowSteps from '../flowSteps/FlowSteps';
import Icons from '../icons/Icons';
import { useContext } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';

const SideNavTeardown: React.FC<SideNavItemBaseProps> = (props) => {
  const { open } = props;
  const t = useTranslate();
  const [displayModal, setDisplayModal] = useState<boolean>(false);
  const [shouldResetPipelines, setShouldResetPipelines] =
    useState<boolean>(true);
  const [shouldDeleteIngestSources, setShouldDeleteIngestSources] =
    useState<boolean>(true);
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [success, setSuccess] = useState<boolean>(false);

  const [teardown, loading] = useTeardown();
  const { locked } = useContext(GlobalContext);

  const teardownFunc = () => {
    setSteps([]);
    teardown({
      resetPipelines: shouldResetPipelines,
      deleteIngestSRTSources: shouldDeleteIngestSources
    }).then((res) => {
      const mappedSteps =
        res.value?.map((res) => ({
          ...res,
          step: t(`teardown.${res.step as TeardownStepNames}`) || ''
        })) || [];
      setSteps(mappedSteps);
      if (res.ok) {
        setSuccess(true);
      }
    });
  };

  const onClose = () => {
    setDisplayModal(false);
    setShouldDeleteIngestSources(true);
    setShouldResetPipelines(true);
    setSuccess(false);
    setSteps([]);
  };

  return (
    <div className="relative group">
      <div
        className={`${
          locked ? 'pointer-events-none' : 'pointer-events-auto'
        } flex items-center pl-4 py-4 overflow-hidden rounded-xl hover:bg-light hover:cursor-pointer`}
        onClick={() => setDisplayModal(true)}
      >
        <Icons
          name="IconAlertOctagon"
          className={`${
            locked ? 'stroke-yellow-400/50' : 'stroke-yellow-400'
          } min-w-8 min-h-8 w-8 h-8 mr-4 `}
        />
        <div className="whitespace-nowrap">{t('teardown.name')}</div>
      </div>
      <SideNavTooltip open={open} label={t('teardown.name')} />
      <Modal
        open={displayModal}
        outsideClick={onClose}
        className="min-w-[600px] min-h-40 max-w-[600px]"
      >
        {(!success && (
          <div className="mb-4 font-bold flex justify-between">
            <Icons
              name="IconAlertTriangle"
              className="min-w-8 min-h-8 w-8 h-8 stroke-red-500"
            />
            <div className="flex justify-center align-center">
              <p className="mt-2">
                {loading ? t('teardown.tearing_down') : t('teardown.warning')}
              </p>
            </div>
            <Icons
              name="IconAlertTriangle"
              className="min-w-8 min-h-8 w-8 h-8 stroke-red-500"
            />
          </div>
        )) || (
          <div className="flex justify-center mb-4 font-bold">
            {t('teardown.results')}
          </div>
        )}
        {(!steps.length && !loading && (
          <div className="px-16">
            <div className="mb-4">{t('teardown.are_you_sure')}</div>
            <div>{t('teardown.description')}</div>
            <div>- {t('teardown.pipeline_streams')}</div>
            <div>- {t('teardown.pipeline_output_streams')}</div>
            <div>- {t('teardown.pipeline_multiviewers')}</div>
            <div>- {t('teardown.pipeline_control_connections')}</div>
            <div>- {t('teardown.controlpanel_control_connections')}</div>
            <div>- {t('teardown.ingest_streams')}</div>
            <div className="mt-4">{t('teardown.optional')}</div>
            <div className="flex flex-row gap-4">
              <div
                className="flex flex-row hover:cursor-pointer"
                onClick={() => setShouldResetPipelines(!shouldResetPipelines)}
              >
                <input
                  type="checkbox"
                  className="flex ml-2 w-4 justify-center rounded-lg text-zinc-300 hover:cursor-pointer"
                  checked={shouldResetPipelines}
                  onChange={() =>
                    setShouldResetPipelines(!shouldResetPipelines)
                  }
                />
                <label className="ml-2 mt-1 text-left text-zinc-300 hover:cursor-pointer">
                  {t('teardown.reset_pipelines')}
                </label>
              </div>
              <div
                className="flex flex-row hover:cursor-pointer"
                onClick={() =>
                  setShouldDeleteIngestSources(!shouldDeleteIngestSources)
                }
              >
                <input
                  type="checkbox"
                  className="flex ml-2 w-4 justify-center rounded-lg text-zinc-300 hover:cursor-pointer"
                  checked={shouldDeleteIngestSources}
                  onChange={() =>
                    setShouldDeleteIngestSources(!shouldDeleteIngestSources)
                  }
                />
                <label className="ml-2 mt-1 text-left text-zinc-300 hover:cursor-pointer">
                  {t('teardown.ingest_src_sources')}
                </label>
              </div>
            </div>
            <div className="flex justify-center w-full min-w-max mt-4 gap-16">
              <Button
                className="hover:bg-red-500 w-20 justify-around"
                onClick={onClose}
                state="warning"
              >
                {t('close')}
              </Button>
              <Button
                className="relative flex hover:bg-green-400 w-20 justify-around"
                type="submit"
                onClick={teardownFunc}
              >
                {t('yes')}
              </Button>
            </div>
          </div>
        )) ||
          (loading && (
            <div className="flex flex-row justify-around align-center w-full mt-12">
              <Loader className="w-10 h-5" />
            </div>
          )) || (
            <div>
              <FlowSteps steps={steps} />
              <div className="flex justify-center w-full min-w-max mt-4 gap-16">
                <Button
                  className="hover:bg-red-500 w-20 justify-around"
                  onClick={onClose}
                  state="warning"
                >
                  {t('close')}
                </Button>
                {!success && (
                  <Button
                    className="relative flex hover:bg-green-400 min-w-20 justify-around"
                    type="submit"
                    onClick={teardownFunc}
                  >
                    {t('workflow.retry')}
                  </Button>
                )}
              </div>
            </div>
          )}
      </Modal>
    </div>
  );
};

export default SideNavTeardown;
