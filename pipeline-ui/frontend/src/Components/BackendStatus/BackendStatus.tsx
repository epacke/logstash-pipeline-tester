import React, {useEffect, useState} from 'react';
import BackendIcon from '../../Assets/Icons/BackendIcon';
import {Badge, Box, Tooltip} from '@mui/material';
import {CheckCircle} from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import {BackendStatusHelp} from '../HelpPopups/HelpPopups';

interface IBackendState {
  backendConnected: boolean | null,
}

const BackendState = (props: IBackendState) => {

  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const {backendConnected} = props;
  const [icon, setIcon] = useState(<CheckCircle color={'success'}/>);

  useEffect(() => {
    if (backendConnected === null) return;
    setIcon(backendConnected ?
      <CheckCircle color={'success'}/>:
      <ErrorIcon color="error"/>);
  }, [backendConnected]);

  const handleBackendStatusClick = () => {
    setHelpOpen(true);
  };

  return (
    <>
      <Tooltip title={backendConnected ?
        'Backend server running': 'Backend server down'}>
        <Box onClick={handleBackendStatusClick} sx={{cursor: 'pointer'}}>
          <Badge
            data-cy='backend-status-badge'
            invisible={backendConnected === null}
            badgeContent={icon}
          >
            <BackendIcon/>
          </Badge>
        </Box>
      </Tooltip>
      <BackendStatusHelp open={helpOpen} setOpen={setHelpOpen}/>
    </>
  );
};

export default BackendState;
