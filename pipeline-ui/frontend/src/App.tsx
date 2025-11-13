import React, {useEffect, useState} from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import Menu from './Layout/Menu/Menu';
import {Grid, Paper} from '@mui/material';
import ConnectBackend from './Util/ConnectBackend';
import LogstashLogLines from './Components/InputTextarea/LogstashLogLines';
import {Result} from './Components/Result/Result';

// Content-based hash function that handles Unicode characters including emojis
// Processes entire string to avoid collisions with similar log content
const generateKey = (str: string): string => {
  // Use UTF-8 encoding to properly handle Unicode characters
  const utf8Bytes = new TextEncoder().encode(str);
  let hash = 0;

  // Hash all bytes to ensure uniqueness even with similar content
  for (let i = 0; i < utf8Bytes.length; i++) {
    hash = ((hash << 5) - hash) + utf8Bytes[i];
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Combine hash with length for additional uniqueness
  return `result-${Math.abs(hash)}-${str.length}`;
};

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

  useEffect(() => {
    ConnectBackend(setBackendConnected, handleLogStashResult);
  }, []);

  const handleMinifyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinifyEnabled(event.target.checked);
  };

  return (
    <Grid container spacing={2} p={2}>
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
                <Result key={generateKey(res)} result={res}/>
              );
            }) :
            ''
        }
      </Grid>
    </Grid>
  );
}

export default App;
