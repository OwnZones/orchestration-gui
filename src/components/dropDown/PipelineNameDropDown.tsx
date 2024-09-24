import { useEffect, useState } from 'react';
import DropDown from './DropDown';

type PipelineNamesDropDownProps = {
  label: string;
  options?: { option: string; available: boolean; id: string }[];
  initial?: string;
  setSelectedPipelineName: (
    pipelineIndex: number,
    pipelineName?: string,
    id?: string
  ) => void;
  pipelineIndex: number;
  disabled: boolean;
};
export default function PipelineNamesDropDown({
  label,
  options,
  setSelectedPipelineName,
  pipelineIndex,
  initial,
  disabled
}: PipelineNamesDropDownProps) {
  const [selected, setSelected] = useState<string | undefined>(initial);
  useEffect(() => {
    const id = options?.find((o) => o.option === selected)?.id;
    setSelectedPipelineName(pipelineIndex, selected, id);
  }, [selected]);

  const handleSetSelected = (option: string) => {
    setSelected((prevState) => {
      if (prevState === option) return undefined;
      return option;
    });
  };
  useEffect(() => {
    if (!options || options.length === 0) return;
    const initialDoesNotExist = !options?.find((o) => o.option === initial);
    if (initialDoesNotExist || !initial) {
      setSelected(undefined);
    } else {
      setSelected(initial);
    }
  }, [initial]);

  return (
    <div>
      <DropDown
        disabled={disabled}
        title="Select pipeline"
        label={label}
        options={options}
        selected={selected}
        setSelected={handleSetSelected}
      />
    </div>
  );
}
