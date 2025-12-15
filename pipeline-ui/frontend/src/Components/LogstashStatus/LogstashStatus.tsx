import React, {useState, useEffect} from 'react';
import {Backend} from '../../Util/Backend';
import LogstashIcon from '../../Assets/Icons/LogstashIcon';
import {Badge, Box, Tooltip} from '@mui/material';
import {CheckCircle} from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import {LogstashStatusHelp} from '../HelpPopups/HelpPopups';

const LogStashState = () => {

  const [connected, setConnected] = useState<boolean | null>(null);
  const [icon, setIcon] = useState(<CheckCircle color={'success'}/>);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  useEffect(() => {
    setIcon(connected ?
      <CheckCircle color={'success'}/>:
      <ErrorIcon color="error"/>);
  }, [connected]);

  const handleLogstashStatusClick = () => {
    setHelpOpen(true);
  };

  useEffect(() => {
    const logstashStateInterval = setInterval(() => {
      getLogstashState(setConnected);
    }, 2000);
    return () => {
      clearInterval(logstashStateInterval);
    };
  }, []);

  return (
    <>
      <Tooltip title={connected ? 'Logstash is running': 'Logstash is down'}>
        <Box onClick={handleLogstashStatusClick} sx={{cursor: 'pointer'}}>
          <Badge
            data-cy='logstash-status-badge'
            invisible={connected === null}
            badgeContent={icon}
          >
            <LogstashIcon/>
          </Badge>
        </Box>
      </Tooltip>
      <LogstashStatusHelp open={helpOpen} setOpen={setHelpOpen} />
    </>
  );
};

const getLogstashState = async (
  setLogStashConnected: (status: boolean) => void) => {
  try {
    const res = await fetch(`${Backend}/api/v1/logstashStatus`);
    const logstashStatus = await res.json();

    if (!logstashStatus.logstashAPI) {
      setLogStashConnected(false);
    } else {
      setLogStashConnected(true);
    }
  } catch (_e) {
    setLogStashConnected(false);
  }
};

export default LogStashState;
