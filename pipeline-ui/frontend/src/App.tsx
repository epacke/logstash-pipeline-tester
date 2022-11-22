import React, {useEffect, useState} from 'react';
import JSONPretty from 'react-json-pretty';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import Menu from './Layout/Menu/Menu';
import {IPipeline} from './Interfaces/CommonInterfaces';
import {Grid, Paper} from '@mui/material';
import LogstashInputRow from './Components/InputRow/LogstashInputRow';
import ConnectBackend from './Util/ConnectBackend';

function App() {
  const [pipeline, setPipeline] = useState<IPipeline | null>(null);
  const [port, setPort] = useState<string>('');
  const [protocol, setProtocol] = useState<string>('');
  const [
    backendConnected, setBackendConnected,
  ] = useState<boolean | null>(null);
  const [logStashResult, setLogstashResult] = useState<string[]>([]);

  useEffect(() => {
    if (!pipeline) {
      return;
    }
    const {port, protocol} = pipeline;
    setPort(port);
    setProtocol(protocol);
  }, [pipeline]);

  const handleLogStashResult = (message: string) => {
    setLogstashResult((prevState) => {
      return [...prevState, message];
    });
  };

  useEffect(() => {
    ConnectBackend(setBackendConnected, handleLogStashResult);
  }, []);

  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <Menu
          setPipeline={setPipeline}
          backendConnected={backendConnected}
        />
      </Grid>
      <LogstashInputRow
        port={port}
        setPort={setPort}
        protocol={protocol}
        setProtocol={setProtocol}
        setLogstashResult={setLogstashResult}
      />
      <Grid item xs={12}>
        {
          logStashResult.length ?
            logStashResult.map((res) => {
              return (
                <Paper key={btoa(res)}>
                  <JSONPretty
                    data-cy="logstash-result"
                    id="json-pretty"
                    data={res}
                  />
                </Paper>
              );
            }) :
            ''
        }
      </Grid>
    </Grid>
  );
}

export default App;
