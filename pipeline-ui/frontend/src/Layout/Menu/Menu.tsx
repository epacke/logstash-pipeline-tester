import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import SelectPipeline from '../../Components/SelectPipeline/SelectPipeline';
import {IPipeline} from '../../Interfaces/CommonInterfaces';
import {Box, Button} from '@mui/material';
import LogstashStatus from '../../Components/LogstashStatus/LogstashStatus';
import BackendStatus from '../../Components/BackendStatus/BackendStatus';
import HelpButton from '../../Components/GeneralHelp/GeneralHelp';
import SelectProtocol from '../../Components/SelectProtocol/SelectProtocol';
import InputPort from '../../Components/InputPort/InputPort';
import SendIcon from '@mui/icons-material/Send';
import FormControl from '@mui/material/FormControl';
import {useEffect, useState} from 'react';
import {Backend} from '../../Util/Backend';
import ValidatePortInput from '../../Util/ValidatePortInput';

function ResponsiveAppBar(props: {
  rawData: string,
  backendConnected: boolean | null,
  setLogstashResult: (result: string[]) => void,
}) {

  const {setLogstashResult, rawData, backendConnected} = props;

  const [pipeline, setPipeline] = useState<IPipeline | null>(null);
  const [port, setPort] = useState<string>('');
  const [protocol, setProtocol] = useState<string>('TCP');
  const [portError, setPortError] = useState(false);

  useEffect(() => {
    if (!pipeline) {
      return;
    }
    const {port, protocol} = pipeline;
    setPort(port);
    setProtocol(protocol);
  }, [pipeline]);

  const handleSubmit = () => {
    if (!ValidatePortInput(port)) {
      setPortError(true);
      return;
    }
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
      <AppBar
        position="fixed"
        sx={{
          background: '#fff',
          color: '#000',
          minHeight: '120px',
          justifyContent: 'center',
        }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box ml={2} mr={3}>
              <img style={{maxHeight: '60px'}} src="logo.png"/>
            </Box>
            <Box mr={2}>
              <SelectPipeline setPipeline={setPipeline}/>
            </Box>
            <Box mr={2}>
              <SelectProtocol protocol={protocol} setProtocol={setProtocol}/>
            </Box>
            <Box mr={2}>
              <InputPort
                error={portError}
                setError={setPortError}
                port={port}
                setPort={setPort}
              />
            </Box>
            <FormControl
              size="small"
              sx={{flexGrow: 1}}
            >
              <Box>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  endIcon={<SendIcon />}
                  data-cy="send-raw-logs"
                >
                  Send
                </Button>
              </Box>
            </FormControl>
            <Box mr={3}>
              <LogstashStatus/>
            </Box>
            <Box mr={3}>
              <BackendStatus backendConnected={backendConnected}/>
            </Box>
            <Box mr={2}>
              <HelpButton/>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar sx={{marginBottom: '40px'}}/>
    </>
  );
}

export default ResponsiveAppBar;
