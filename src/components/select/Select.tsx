type SortSelectProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  classNames?: string;
};

export const Select = ({
  value,
  onChange,
  options,
  classNames
}: SortSelectProps) => {
  return (
    <select
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
