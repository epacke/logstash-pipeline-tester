import * as React from 'react';
import {
  ChangeEvent,
  useRef,
  MutableRefObject,
  useEffect,
  useState,
} from 'react';
import {TextField} from '@mui/material';

const minifyJson = (rawString: string) => {
  let result = rawString;
  try {
    result = JSON.stringify(JSON.parse(rawString));
  } catch {}
  return result;
};

export default function LogstashLogLines(
  props: {
    setRawData: (rawData: string) => void,
    minifyEnabled: boolean,
  },
) {
  const {setRawData, minifyEnabled} = props;
  const [rowCount, setRowCount] = useState<number>(1);
  const [helperText, setHelperText] = useState<string>('');
  const logInput = useRef() as MutableRefObject<HTMLTextAreaElement>;

  useEffect(() => {
    setHelperText(`Will send ${rowCount} document${
      rowCount == 1 ? '': 's'
    } to logstash`);
  }, [rowCount]);

  useEffect(() => {
    handleRawDataBlur();
  }, [minifyEnabled]);

  const handleRawDataBlur = () => {
    const {value} = logInput.current;
    if (minifyEnabled) {
      logInput.current.value = minifyJson(value);
    }
  };

  const handleRawDataChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const {target} = e;
    const {value} = target;
    setRowCount(value.split(/\r\n|\r|\n/).length);
    setRawData(value);
  };

  return (
    <TextField
      fullWidth
      id="outlined-helperText"
      label="Paste your raw pipeline data here"
      helperText={helperText}
      defaultValue=''
      multiline
      onChange={handleRawDataChange}
      onBlur={handleRawDataBlur}
      data-cy='raw-logs-input'
      maxRows={4}
      inputRef={logInput}
    />
  );
}
