import express from 'express';
import sendTCP from './sendTCPString';
import sendUDP from './sendUDPString';

const router = express.Router();

// Receive lines from the web ui
router.post('/', function(req, res) {
  let {sendString} = req.body;
  const {port, protocol} = req.body;
  sendString = `${sendString}\n`;
  if (protocol === 'TCP') {
    sendTCP(sendString, port);
  } else {
    sendUDP(sendString, port);
  }
  res.status(200).end();
});

export default router;
