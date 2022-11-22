import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import SelectPipeline from '../../Components/SelectPipeline/SelectPipeline';
import {IPipeline} from '../../Interfaces/CommonInterfaces';
import {Box} from '@mui/material';
import LogstashStatus from '../../Components/LogstashStatus/LogstashStatus';
import BackendStatus from '../../Components/BackendStatus/BackendStatus';
import HelpButton from '../../Components/GeneralHelp/GeneralHelp';

function ResponsiveAppBar(props: {
  setPipeline: (pipeline: IPipeline | null ) => void,
  backendConnected: boolean | null,
}) {
  const {setPipeline, backendConnected} = props;

  return (
    <AppBar
      position="static"
      sx={{
        background: '#fff',
        color: '#000',
        minHeight: '80px',
        justifyContent: 'center',
      }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{display: {xs: 'none', sm: 'block'}}}
          >
            Logstash Pipeline Tester
          </Typography>
          <Box sx={{flexGrow: 1}}>
            <SelectPipeline setPipeline={setPipeline}/>
          </Box>
          <Box mr={3}>
            <LogstashStatus/>
          </Box>
          <Box mr={3}>
            <BackendStatus backendConnected={backendConnected}/>
          </Box>
          <Box mr={8}>
            <HelpButton/>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
