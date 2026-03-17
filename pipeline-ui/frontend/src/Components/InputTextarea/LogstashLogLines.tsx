import * as React from 'react';
import {
  useRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {TextField} from '@mui/material';

export default function LogstashLogLines(
  props: {
    setRawData: (rawData: string) => void,
    rawData: string,
    minifyEnabled: boolean,
  },
) {

  const {setRawData, rawData, minifyEnabled} = props;
  const [rowCount, setRowCount] = useState<number>(1);
  const [helperText, setHelperText] = useState<JSX.Element>(<></>);
  const [validJson, setValidJson] = useState<boolean>(false);
  const logInput = useRef() as MutableRefObject<HTMLTextAreaElement>;

  const minifyJson = useCallback((rawString: string) => {
    let result = rawString;
    try {
      result = JSON.stringify(JSON.parse(rawString));
      setValidJson(true);
    } catch {
      setValidJson(false);
    }
    return result;
  }, []);

  const handleRawDataChange = useCallback(() => {
    const {value} = logInput.current;
    if (minifyEnabled) {
      logInput.current.value = minifyJson(value);
    }
    setRowCount(value.split(/\r\n|\r|\n/).length);
    setRawData(value);
  }, [minifyEnabled, setRawData, minifyJson]); // eslint-disable-line react-hooks/exhaustive-deps -- logInput is a ref, intentionally omitted

  useEffect(() => {
    handleRawDataChange();
  }, [minifyEnabled, rowCount, handleRawDataChange]);

  useEffect(() => {
    const jsonState = minifyEnabled && !validJson ?
      <span
        style={{color: 'red'}}>
         &nbsp;Can&apos;t minify: Invalid JSON
      </span> :
      null;
    setHelperText(
      <>
        <span>
          {
            `Will send ${rowCount} document${
              rowCount == 1 ? '': 's'
            }`
          }
        </span>
        {jsonState}
      </>,
    );
  }, [rowCount, rawData, minifyEnabled, validJson]);

  useEffect(() => {
    handleRawDataChange();
  }, [minifyEnabled, handleRawDataChange]);

  return (
    <TextField
      fullWidth
      id="outlined-helperText"
      label="Paste your raw pipeline data here"
      helperText={helperText}
      defaultValue=''
      multiline
      onChange={handleRawDataChange}
      onPaste={handleRawDataChange}
      onBlur={handleRawDataChange}
      data-cy='raw-logs-input'
      maxRows={4}
      inputRef={logInput}
    />
  );
}
