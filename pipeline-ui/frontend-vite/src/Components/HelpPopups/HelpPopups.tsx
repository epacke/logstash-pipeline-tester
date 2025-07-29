import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Link from '@mui/material/Link';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {Backend} from '../../Util/Backend';

const HelpPopup = function(
  props: {
    content: JSX.Element,
    open: boolean,
    setOpen: (open: boolean) => void
  }) {

  const {content, open, setOpen} = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {content}
        <DialogActions sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const LogstashStatusHelp = (
  props: {
    open: boolean,
    setOpen: (open: boolean) => void},
) => {
  const {open, setOpen} = props;
  const content = <>
    <DialogTitle sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} id="alert-dialog-title"
    >
      {'About Logstash Status'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Logstash should be running in the background as a container.
        The frontend and backend expects it to be reachable on port 9600.
        <br/>
        The error icon will show if the frontend application is unable to
        connect to logstash. Have a look at the docker logs to ensure
        that logstash is running.
      </DialogContentText>
    </DialogContent>
  </>;

  return (
    <HelpPopup content={content} open={open} setOpen={setOpen}/>
  );
};

const BackendStatusHelp = (
  props: {
    open: boolean,
    setOpen: (open: boolean) => void},
) => {
  const {open, setOpen} = props;
  const content = <>
    <DialogTitle sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} id="alert-dialog-title"
    >
      {'About Backend Status'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        The backend process is running in the container and the
        frontend Web UI is trying to reach it via {Backend}.
        <br/>
        If it is unable to you&apos;ll see an error.
        Check the docker container and validate that the
        backend process is still running.
      </DialogContentText>
    </DialogContent>
  </>;

  return (
    <HelpPopup content={content} open={open} setOpen={setOpen}/>
  );
};

const GeneralHelp = (
  props: {
    open: boolean,
    setOpen: (open: boolean) => void},
) => {
  const {open, setOpen} = props;
  const content = <>
    <DialogTitle sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} id="alert-dialog-title"
    >
      {'About this tool'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        It&lsquo;s pretty easy. Pick protocol, enter port and then submit
        your log lines to the logstash backend.
        <br/>
        If you need further assistance or guidance on how to
        use this tool, please check either <Link
          href="https://loadbalancing.se/2020/03/11/logstash-testing-tool/">
          the manual
        </Link>
        , or the projects <Link
          href={
            'https://github.com/epacke/logstash-pipeline-tester/tree/master/' +
            'pipeline-ui/frontend/src'}>
          GitHub page
        </Link>.
        <br/><br/>
        If you have found a bug or issue, please <Link
          href="https://github.com/epacke/logstash-pipeline-tester/issues">
          report it here
        </Link>.
      </DialogContentText>
    </DialogContent>
  </>;

  return (
    <HelpPopup content={content} open={open} setOpen={setOpen}/>
  );
};

export {LogstashStatusHelp, BackendStatusHelp, GeneralHelp};
