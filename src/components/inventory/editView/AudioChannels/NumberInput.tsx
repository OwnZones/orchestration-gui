import styles from './checkbox.module.scss';

interface IEvent {
  target: {
    value: string;
  };
}
interface IInputRow {
  value: string;
  max: number;
  isDisabled: boolean;
  updateRows: (e: IEvent) => void;
}

export default function InputRow({
  value,
  max,
  isDisabled,
  updateRows
}: IInputRow) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      max={max}
      onChange={updateRows}
      disabled={isDisabled}
      className={`w-[100%] h-[100%] appearance-none text-black text-center ${
        styles.numberInput
      } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    />
  );
}
