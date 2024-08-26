type SelectProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
};

export const SortSelect = ({ value, onChange, options }: SelectProps) => {
  return (
    <select
      className="border justify-center text-sm rounded-lg w-1/2 pl-2 py-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
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
