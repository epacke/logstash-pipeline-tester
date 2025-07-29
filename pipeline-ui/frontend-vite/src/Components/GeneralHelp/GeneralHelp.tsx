import React, {useState} from 'react';
import {Box, Tooltip} from '@mui/material';
import {GeneralHelp} from '../HelpPopups/HelpPopups';
import HelpIcon from '../../Assets/Icons/HelpIcon';

const BackendState = () => {

  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const handleHelpClick = () => {
    setHelpOpen(true);
  };

  return (
    <>
      <Tooltip title={'Help'}>
        <Box onClick={handleHelpClick} sx={{cursor: 'pointer'}}>
          <HelpIcon/>
        </Box>
      </Tooltip>
      <GeneralHelp open={helpOpen} setOpen={setHelpOpen}/>
    </>
  );
};

export default BackendState;
