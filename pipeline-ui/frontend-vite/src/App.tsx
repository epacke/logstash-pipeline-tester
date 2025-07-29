import React, {useEffect, useState} from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import Menu from './Layout/Menu/Menu';
import { Paper} from '@mui/material';
import Grid from '@mui/material/Grid';
import ConnectBackend from './Util/ConnectBackend';
import LogstashLogLines from './Components/InputTextarea/LogstashLogLines';
import {Result} from './Components/Result/Result';

function App() {
  const [
    backendConnected, setBackendConnected,
  ] = useState<boolean | null>(null);
  const [logStashResult, setLogstashResult] = useState<string[]>([]);
  const [rawData, setRawData] = useState<string>('');
  const [minifyEnabled, setMinifyEnabled] = useState(false);

  const handleLogStashResult = (message: string) => {
    setLogstashResult((prevState) => {
      return [...prevState, message];
    });
  };

  const handleMinifyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinifyEnabled(event.target.checked);
  };

  return (
    <Grid container spacing={2} p={2}>
      <ConnectBackend
        setBackendConnected={setBackendConnected}
        handleLogStashResult={handleLogStashResult}
      />
      <Grid item xs={12}>
        <Menu
          setLogstashResult={setLogstashResult}
          rawData={rawData}
          backendConnected={backendConnected}
          handleMinifyChange={handleMinifyChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{
          height: '100%',
          minHeight: '100px',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          padding: '1em 1em 0em 1em',
        }}>
          <LogstashLogLines
            minifyEnabled={minifyEnabled}
            setRawData={setRawData}
            rawData={rawData}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        {
          logStashResult.length ?
            logStashResult.map((res) => {
              return (
                <Result key={btoa(res)} result={res}/>
              );
            }) :
            ''
        }
      </Grid>
    </Grid>
  );
}

export default App;
