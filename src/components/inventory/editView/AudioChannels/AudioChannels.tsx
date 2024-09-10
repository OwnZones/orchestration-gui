import { useContext, useEffect, useState, useRef } from 'react';
import { EditViewContext, IInput } from '../../EditViewContext';
import NumbersRow from './NumbersRow';
import { getValue, oneBased } from './utils';
import Error from './Error';
import OutputName from './OutputName';
import Outputs from './Outputs';
import { Source, Numbers } from '../../../../interfaces/Source';
import { useTranslate } from '../../../../i18n/useTranslate';
import { channel, mapAudio } from '../../../../utils/audioMapping';

interface IAudioChannels {
  source: Source;
  isLocked: boolean;
}

export default function AudioChannels({ source, isLocked }: IAudioChannels) {
  type TOutputs = 'audio_mapping.outL' | 'audio_mapping.outR';
  const t = useTranslate();
  const outputs: TOutputs[] = ['audio_mapping.outL', 'audio_mapping.outR'];
  const previousError = useRef<NodeJS.Timeout>();
  const {
    audioStream,
    input: [input, setInput]
  } = useContext(EditViewContext);

  const [error, setError] = useState('');
  const [outputRows, setRows] = useState<{ id: string; value: string }[][]>([]);

  const { number_of_channels: numberOfChannels = 0 } = audioStream || {};

  const channelsInArray: number[] = [];
  for (let i = 1; i <= numberOfChannels; i++) {
    channelsInArray.push(i);
  }

  useEffect(() => {
    let array = [channelsInArray.map(() => channel(''))];

    if (source?.audio_stream.audio_mapping) {
      const audioMapping = oneBased(source.audio_stream.audio_mapping);

      if (audioMapping.length) {
        array = mapAudio(audioMapping, channelsInArray);
      }
    }

    setRows(() => array);
  }, [source]);

  useEffect(() => {
    if (!outputRows.length || !numberOfChannels) {
      return;
    }

    const firstValue = outputRows[0][0].value;

    // We only have one value at the first row
    if (outputRows.length === 1 && firstValue) {
      const outputsInNewArray = [...outputs];

      outputsInNewArray.pop();

      const newRows = outputsInNewArray.map(() =>
        channelsInArray.map(() => channel(''))
      );
      setRows((state) => [...state, ...newRows]);
    }

    // We remove first value on the first row.
    if (outputRows.length > 1 && !firstValue) {
      setRows(() => [channelsInArray.map(() => channel(''))]);
    }

    const newAudioMapping: Numbers[] = [];

    // If we have both Out L and Out R visible
    if (outputRows.length > 1) {
      let alarm;

      // If there is no value between two channels that has a value, then show an error and prevent
      // the user from being able to save.
      for (let i = 0; i < outputRows.length; i++) {
        const nextI = i + 1;
        const currentRow = outputRows[i];
        const nextRow = outputRows[nextI];

        for (let y = 0; y < outputRows[i].length; y++) {
          const nextY = y + 1;

          const nextValue = getValue(currentRow, nextY);
          const nextBottomValue = getValue(nextRow, nextY);
          const currentValue = getValue(currentRow, y);
          const currentBottom = getValue(nextRow, y);

          if (
            !i &&
            !currentBottom &&
            !currentValue &&
            (nextValue || nextBottomValue)
          ) {
            alarm = true;
            break;
          }
        }
      }

      if (alarm && firstValue) {
        setError(() => t('audio_mapping.emptyBetween'));
      }

      if (!alarm) {
        // Modify the rows so it becomes a valid array for example
        // [1,2],3,4
        for (let i = 0; i < outputRows.length; i++) {
          const current = outputRows[i];
          const next = outputRows[i + 1];

          if (!next) {
            break;
          }

          for (let y = 0; y < outputRows[i].length; y++) {
            const currentValue = current && current[y] && current[y].value;
            const nextValue = next[y + 1] && next[y + 1].value;

            if (currentValue && nextValue) {
              newAudioMapping.push([Number(currentValue), Number(nextValue)]);
            } else if (currentValue) {
              newAudioMapping.push(Number(currentValue));
            }
          }
        }
      }
    }

    if (
      input.audioMapping &&
      JSON.stringify(input.audioMapping) !== JSON.stringify(newAudioMapping)
    ) {
      if (
        newAudioMapping.length === 0 &&
        input.audioMapping.flat().length > 2 &&
        firstValue
      ) {
        return;
      }
      setInput((state: IInput) => ({
        ...state,
        audioMapping: newAudioMapping
      }));
    }
  }, [outputRows]);

  useEffect(() => {
    if (error) {
      if (previousError.current) {
        clearTimeout(previousError.current);
      }

      previousError.current = setTimeout(() => setError(() => ''), 5000);
    }

    return () => clearTimeout(previousError.current);
  }, [error]);

  if (!audioStream?.number_of_channels) {
    return null;
  }

  interface IEvent {
    target: {
      value: string;
    };
  }

  const updateRows = (
    e: IEvent,
    rowIndex: number,
    index: number,
    id: string
  ) => {
    const isAlreadyUsed = outputRows.some((values) => {
      const find = values.find(
        ({ value }) => value && value === e.target.value
      );

      return find;
    });

    if (isAlreadyUsed) {
      return setError(() =>
        t('audio_mapping.alreadyUsed', { value: e.target.value })
      );
    }

    if (Number(e.target.value) > max) {
      return setError(() => t('audio_mapping.maxError', { max: String(max) }));
    }

    if (e.target.value.includes('-')) {
      return setError(() => t('audio_mapping.minError'));
    }

    setRows((state) => {
      const outputRows = [...state];
      outputRows[rowIndex] = [...outputRows[rowIndex]];
      outputRows[rowIndex][index] = { id, value: e.target.value };

      return outputRows;
    });
  };

  const max = channelsInArray[channelsInArray.length - 1];

  if (!numberOfChannels) {
    return null;
  }
  return (
    <div className="text-gray-200 flex flex-col relative">
      <NumbersRow numbers={channelsInArray} />
      {outputRows.map((contents, rowIndex) => (
        <div className="flex" key={rowIndex}>
          <OutputName outputRows={outputRows} name={outputs[rowIndex]} />
          <Outputs
            contents={contents}
            outputRows={outputRows}
            rowIndex={rowIndex}
            max={max}
            isLocked={isLocked}
            updateRows={updateRows}
          />
        </div>
      ))}
      <Error error={error} />
    </div>
  );
}
