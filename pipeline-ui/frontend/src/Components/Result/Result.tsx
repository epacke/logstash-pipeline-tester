import {Box, Button, Paper} from '@mui/material';
import JSONPretty from 'react-json-pretty';
import React from 'react';
import {ContentCopy} from '@mui/icons-material';

const Result = (props: {result: string}) => {

  const {result} = props;

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <Paper sx={{position: 'relative'}}>
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
          size='small'
          sx={{
            marginTop: '15px',
            paddingTop: '5px',
            color: '#333',
            width: '150px',
            fontSize: '11px',
          }}
          startIcon={<ContentCopy sx={{}} />}
          onClick={handleCopy}
          data-cy="send-raw-logs"
        >
        Copy to clipboard
        </Button></Box>
      <Box sx={{marginTop: '50px'}}>
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
