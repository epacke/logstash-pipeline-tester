import * as React from 'react';
import {ChangeEvent, useEffect, useState} from 'react';
import {TextField} from '@mui/material';


export default function LogstashLogLines(
  props: {setRawData: (rawData: string) => void}) {

  const {setRawData} = props;
  const [rowCount, setRowCount] = useState<number>(1);
  const [helperText, setHelperText] = useState<string>('');

  useEffect(() => {
    setHelperText(`Will send ${rowCount} document${
      rowCount == 1 ? '': 's'
    } to logstash`);
  }, [rowCount]);

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
      data-cy='raw-logs-input'
      maxRows={4}
    />
  );
}
