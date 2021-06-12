import express from 'express';
import sendTCP from './sendTCPString';
import sendUDP from './sendUDPString';

const router = express.Router();

// Receive lines from the web ui
router.post('/', function(req, res) {
  let {sendString, port, protocol} = req.body;
  sendString = `${sendString}\n`;
  protocol === 'TCP' ? sendTCP(sendString, port) : sendUDP(sendString, port);
  res.status(200).end();
});

export default router;
