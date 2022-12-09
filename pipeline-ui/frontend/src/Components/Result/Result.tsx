import {Box, Button, Paper} from '@mui/material';
import JSONPretty from 'react-json-pretty';
import React, {useState, useRef, MutableRefObject} from 'react';
import {ContentCopy} from '@mui/icons-material';

const Result = (props: {result: string}) => {

  const [showCopy, setShowCopy] = useState(false);
  const {result} = props;
  const copyButton = useRef() as MutableRefObject<HTMLButtonElement>;

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <Paper
      sx={{position: 'relative'}}
      onMouseEnter={() => {
        setShowCopy(true);
      }}
      onMouseLeave={() => {
        setShowCopy(false);
      }}
      data-cy='logstash-result-container'
    >
      <Box
        sx={{
          position: 'absolute',
          top: '0px',
          right: '70px',
          zIndex: 999,
          height: '100px',
          width: '100px',
        }}
      >
        <Button
          ref={copyButton}
          size='small'
          sx={{
            marginTop: '15px',
            paddingTop: '5px',
            color: '#333',
            width: '150px',
            fontSize: '11px',
            display: showCopy ? '': 'none',
          }}
          startIcon={<ContentCopy sx={{}} />}
          onClick={handleCopy}
          data-cy="copy-result-button"
        >
        Copy to clipboard
        </Button></Box>
      <Box
        className='result-box'
        sx={{marginTop: '50px'}}
      >
        <JSONPretty
          data-cy="logstash-result"
          id="json-pretty"
          data={result}
        />
      </Box>
    </Paper>
  );
};

export {Result};
