import * as React from 'react';
import {SyntheticEvent, useEffect} from 'react';
import {TextField} from '@mui/material';
import ValidatePortInput from '../../Util/ValidatePortInput';

interface IInputPortProps {
  error: boolean,
  setError: (state: boolean) => void,
  port: string,
  setPort: (port: string) => void,
}

export default function InputPort(props: IInputPortProps) {

  const {port, setPort, error, setError} = props;

  useEffect(() => {
    setError(!ValidatePortInput(port) && port !== '');
  }, [port]);

  const handleChange = (event: SyntheticEvent) => {
    const {value} = event.target as HTMLInputElement;
    const validPort = ValidatePortInput(value) || value === '';
    setError(!validPort);
    setPort(value);
  };

  return (
    <TextField
      sx={{maxWidth: '9em', marginTop: '24px', marginRight: '0.5em'}}
      error={error}
      size="small"
      id="outlined-error-helper-text"
      label="Port number"
      onChange={handleChange}
      onInput={handleChange}
      value={port}
      helperText={error ? 'Invalid port number': ' '}
      data-cy='send-port'
    />
  );
}
