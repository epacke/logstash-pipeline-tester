import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import SendIcon from '@mui/icons-material/Send';
import {Box, Button, Grid, Paper} from '@mui/material';
import SelectProtocol from './SelectProtocol/SelectProtocol';
import InputPort from './InputPort/InputPort';
import LogstashLogLines from './LogstashLogLines/LogstashLogLines';
import {Backend} from '../../Util/Backend';
import {useState} from 'react';

interface ILogstashInputRowProps {
  port:string,
  setPort: (port: string) => void
  protocol: string,
  setProtocol: (protocol: string) => void,
  setLogstashResult: (result: string[]) => void,
}

export default function LogstashInputRow(props: ILogstashInputRowProps) {

  const [rawData, setRawData] = useState<string>('');
  const {port, setPort, setLogstashResult, protocol, setProtocol} = props;

  const handleSubmit = () => {
    setLogstashResult([]);
    fetch(
      `${Backend}/api/v1/sendLogLines`, {
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
        },
        'body': JSON.stringify(
          {sendString: rawData, port: port, protocol: protocol},
        ),
      },
    );
  };

  return (
    <>
      <Grid item xs={6} md={8} lg={8} xl={9}>
        <Paper sx={{
          height: '100%',
          minHeight: '100px',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          padding: '1em 1em 0em 1em',
        }}>
          <LogstashLogLines setRawData={setRawData}/>
        </Paper>
      </Grid>
      <Grid item xs={6} md={4} lg={4} xl={3}>
        <Paper sx={{
          height: '100%',
          minHeight: '100px',
          padding: '1em 1em 0em 1em',
          textAlign: 'center',
        }}>
          <FormControl size="small" sx={{minWidth: '50px', marginTop: '18px'}}>
            <Box>
              <SelectProtocol protocol={protocol} setProtocol={setProtocol}/>
              <InputPort port={port} setPort={setPort}/>
              <Button
                variant="contained"
                size='large'
                onClick={handleSubmit}
                sx={{padding: '14px 20px'}}
                endIcon={<SendIcon />}
                data-cy="send-raw-logs"
              >
                Send
              </Button>
            </Box>
          </FormControl>
        </Paper>
      </Grid>
    </>
  );
}
