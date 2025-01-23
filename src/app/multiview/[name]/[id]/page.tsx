'use client';

import { Multiview } from '../../../../components/multiview/Multiview';
import { usePipelines } from '../../../../hooks/pipelines';
import { useTranslate } from '../../../../i18n/useTranslate';
import { use } from 'react';

type PageProps = {
  params: Promise<{ id: number; name: string }>;
};

export default function Page({ params }: PageProps) {
  const [pipelines, loading] = usePipelines();
  const t = useTranslate();
  const id = use(params).id;
  const name = use(params).name;

  const pipeline = pipelines?.find((pipe) => pipe.name === name);
  if (!pipeline) {
    return null;
  }

  return (
    <>
      <Multiview pipeline={pipeline} multiviewId={id} />
      <p className="text-p">
        <i>experimental</i>
      </p>
    </>
  );
}
