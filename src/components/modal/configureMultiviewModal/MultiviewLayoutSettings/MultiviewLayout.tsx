import { TListSource } from '../../../../interfaces/multiview';
import { MultiviewPreset } from '../../../../interfaces/preset';
import Options from '../../configureOutputModal/Options';

export default function MultiviewLayout({
  multiviewPresetLayout,
  inputList,
  handleChange
}: {
  multiviewPresetLayout: MultiviewPreset;
  inputList: TListSource[] | undefined;
  handleChange: (id: string, value: string) => void;
}) {
  return (
    <div
      className={`border-4 border-p/50 relative p-2 m-2`}
      style={{
        width: `${multiviewPresetLayout.layout.output_width}rem`,
        height: `${multiviewPresetLayout.layout.output_height}rem`
      }}
    >
      {multiviewPresetLayout.layout.views.map((singleView) => {
        const { x, y, width, height, label, id } = singleView;

        const sourceId = inputList?.find(
          (source) => source.label === label
        )?.id;

        return (
          <div
            key={x + y}
            className="flex items-center justify-center border-[1px] border-p/50 absolute w-full"
            style={{
              width: `${width}rem`,
              height: `${height}rem`,
              top: `${y}rem`,
              left: `${x}rem`
            }}
          >
            {inputList && (
              <Options
                label={label}
                options={inputList.map((singleSource) => ({
                  id: singleSource.id,
                  label: singleSource.label
                }))}
                value={sourceId ? sourceId : 'empty'}
                update={(value) => handleChange(id || '', value)}
                columnStyle
                emptyFirstOption
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
