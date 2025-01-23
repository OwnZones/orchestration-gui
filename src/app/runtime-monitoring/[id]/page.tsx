'use client';
import { useTranslate } from '../../../i18n/useTranslate';
import { useMonitoring } from '../../../hooks/monitoring';
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { Accordion } from '../../../components/accordion/Accordion';
import Link from 'next/link';
import SourcesList from '../../../components/monitoringList/SourcesList';
import { StreamsList } from '../../../components/monitoringList/StreamsList';
import OutputList from '../../../components/monitoringList/OutputList';
import { MultiviewList } from '../../../components/monitoringList/MultiviewList';
import { ControlReceiverList } from '../../../components/monitoringList/ControlReceiverList';
import { ControlPanelList } from '../../../components/monitoringList/ControlPanelList';
import IngestList from '../../../components/monitoringList/IngestList';
import PipelineList from '../../../components/monitoringList/PipelineList';
import { CompactControlPanelList } from '../../../components/monitoringList/CompactControlPanelList';

import { use } from 'react';

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: Props) {
  const t = useTranslate();
  const productionId = use(params).id;
  const [monitoring] = useMonitoring(productionId);
  if (!monitoring) {
    return null;
  }
  return (
    <div className="p-2">
      <div className="flex flex-row justify-between">
        <div className="text-4xl text-p">
          {t('runtime_monitoring.name')}
          {' - '}
          <span className="opacity-40">{monitoring.productionName}</span>
        </div>
        <div className="flex items-center">
          <div className="group relative mr-2">
            <div className="absolute invisible group-hover:visible right-10 bg-black text-p px-2 w-[350px] text-sm rounded-md">
              <div className="leading-2 pt-2 pb-2">
                <p className="text-p">
                  <span className="text-indicatorGreen">
                    {`${t('runtime_monitoring.green_parameters.title')}: `}
                  </span>
                  <span>{`${t(
                    'runtime_monitoring.green_parameters.description'
                  )}`}</span>
                </p>
                <p className="text-p">
                  <span className="text-indicatorRed">
                    {`${t('runtime_monitoring.red_parameters.title')}: `}{' '}
                  </span>
                  <span>{`${t(
                    'runtime_monitoring.red_parameters.description'
                  )}`}</span>
                </p>
              </div>
              <svg
                className="absolute z-10 -rotate-90 top-[9px] right-[-12px]"
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 10L0 0L16 1.41326e-06L8 10Z" fill="black" />
              </svg>
            </div>
            <IconInfoCircle className="text-p hover:cursor-help" />
          </div>
          <div className="rounded">
            <Link
              className="bg-button-bg hover:bg-button-hover-bg text-button-text font-bold py-2 px-4 rounded inline-flex items-center w-56"
              href={'/'}
            >
              <IconArrowLeft size={16} className="mr-2" />
              {t('runtime_monitoring.to_main_screen')}
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Accordion
          title="Production Components"
          hasError={
            monitoring.productionErrors.productionComponentsErrors.error
          }
        >
          <Accordion
            title="Ingests"
            hasError={
              monitoring.productionErrors.productionComponentsErrors
                .ingestErrors.length > 0
            }
          >
            {monitoring.productionComponents.ingests.map((ingest) => (
              <Accordion
                title={ingest.title}
                key={ingest.ingestUuid}
                hasError={ingest.active.has_error}
              >
                <IngestList ingest={ingest} />
              </Accordion>
            ))}
          </Accordion>
          <Accordion
            title="Pipelines"
            hasError={
              monitoring.productionErrors.productionComponentsErrors
                .pipelineErrors.length > 0
            }
          >
            {monitoring.productionComponents.pipelines.map((pipeline) => (
              <Accordion
                title={pipeline.title}
                key={pipeline.pipelineUuid}
                hasError={pipeline.active.has_error}
              >
                <PipelineList pipeline={pipeline} />
              </Accordion>
            ))}
          </Accordion>
          <Accordion
            title="Control Panels"
            hasError={
              monitoring.productionErrors.productionComponentsErrors
                .controlPanelsErrors.length > 0
            }
          >
            {' '}
            {monitoring.productionComponents.controlPanels.map(
              (controlPanel) => (
                <Accordion
                  title={controlPanel.title}
                  key={controlPanel.controlPanelUuid}
                  hasError={controlPanel.active.has_error}
                >
                  <CompactControlPanelList controlPanel={controlPanel} />
                </Accordion>
              )
            )}
          </Accordion>
        </Accordion>
        <Accordion
          title="Sources"
          hasError={monitoring.productionErrors.sourcesErrors.error}
        >
          {monitoring.sources.map((source) => {
            const hasError =
              monitoring.productionErrors.sourcesErrors.sourcesWithErrors.some(
                (s) => s === source.source_id
              );
            return (
              <Accordion
                title={source.title}
                key={source.source_id + source.title}
                hasError={hasError}
              >
                <SourcesList source={source} />
              </Accordion>
            );
          })}
        </Accordion>
        <Accordion
          title="Streams"
          hasError={monitoring.productionErrors.streamsErrors.error}
        >
          {monitoring.streams.map((stream) => {
            const hasError =
              monitoring.productionErrors.streamsErrors.streamsWithErrors.some(
                (s) => s === stream.title
              );
            return (
              <Accordion
                key={stream.uuid + stream.title}
                title={stream.title}
                hasError={hasError}
              >
                <StreamsList
                  ingestSide={stream.ingestSide}
                  pipelineSide={stream.pipelineSide}
                />
              </Accordion>
            );
          })}
        </Accordion>
        <Accordion
          title="Outputs"
          hasError={monitoring.productionErrors.outputsErrors.error}
        >
          {monitoring.outputs &&
            monitoring.outputs.length > 0 &&
            monitoring.outputs.map((output) => {
              const hasError =
                monitoring.productionErrors.outputsErrors.outputsWithErrors.some(
                  (o) => o === output.uuid
                );
              return (
                <Accordion
                  key={output.uuid + output.title}
                  title={output.title}
                  hasError={hasError}
                >
                  <OutputList output={output} />
                </Accordion>
              );
            })}
        </Accordion>
        <Accordion
          title="Multiviews"
          hasError={monitoring.productionErrors.multiviewsErrors.error}
        >
          {monitoring.multiviews.map((multiview) => {
            const hasError =
              monitoring.productionErrors.multiviewsErrors.multiviewsWithErrors.some(
                (m) => m === multiview.title
              );
            return (
              <Accordion
                key={multiview.uuid + multiview.title}
                title={multiview.title}
                hasError={hasError}
              >
                <MultiviewList multiview={multiview} />
              </Accordion>
            );
          })}
        </Accordion>
        <Accordion
          title="Control Panels"
          hasError={monitoring.productionErrors.controlPanelsErrors.error}
        >
          {monitoring.controlPanels &&
            monitoring.controlPanels.length > 0 &&
            monitoring.controlPanels.map((controlPanel) => {
              const hasError =
                monitoring.productionErrors.controlPanelsErrors.controlPanelsWithErrors.some(
                  (c) => c === controlPanel.title
                );
              return (
                <Accordion
                  key={controlPanel.uuid + controlPanel.title}
                  title={`${controlPanel.title}`}
                  hasError={hasError}
                >
                  <ControlPanelList controlPanel={controlPanel} />
                </Accordion>
              );
            })}
        </Accordion>
        <Accordion
          title="Control Receivers"
          hasError={monitoring.productionErrors.controlReceiversErrors.error}
        >
          {monitoring.controlReceivers &&
            monitoring.controlReceivers.length > 0 &&
            monitoring.controlReceivers.map((receiver) => {
              const hasError =
                monitoring.productionErrors.controlReceiversErrors.controlReceiversWithErrors.includes(
                  receiver.title
                );
              return (
                <Accordion
                  key={receiver.uuid + receiver.title}
                  title={receiver.title}
                  hasError={hasError}
                >
                  <ControlReceiverList receiver={receiver} />
                </Accordion>
              );
            })}
        </Accordion>
      </div>
    </div>
  );
}
