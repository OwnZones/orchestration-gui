type SelectProps = {
  value: string;
  options: readonly string[];
  classNames?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const Select = ({
  value,
  options,
  classNames,
  disabled,
  onChange
}: SelectProps) => {
  return (
    <select
      disabled={disabled}
      className={`border justify-center text-md rounded-lg pl-2 py-2 bg-gray-700 border-gray-600 placeholder-gray-400 text-p ${classNames}`}
      value={value}
      onChange={onChange}
    >
      {options.map((value) => (
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  );
};
