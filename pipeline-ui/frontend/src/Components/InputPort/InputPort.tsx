import * as React from 'react';
import {SyntheticEvent, useState} from 'react';
import {TextField} from '@mui/material';

interface IInputPortProps {
  port: string,
  setPort: (port: string) => void,
}

export default function InputPort(props: IInputPortProps) {

  const {port, setPort} = props;
  const [error, setError] = useState(false);

  const handleChange = (event: SyntheticEvent) => {
    const {value} = event.target as HTMLInputElement;
    const validPort = /^[0-9]*$/.test(value);
    setError(!validPort);
    if (validPort) {
      setPort(value);
    }
  };


  return (
    <TextField
      sx={{maxWidth: '9em', marginTop: '24px', marginRight: '0.5em'}}
      error={error}
      size="small"
      id="outlined-error-helper-text"
      label="Port number"
      onInput={handleChange}
      value={port}
      helperText={error ? 'Invalid port number': ' '}
      data-cy='send-port'
    />
  );
}
