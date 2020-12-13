import express from 'express';
import { getWss } from '../../../index';

const router = express.Router();
// Receive data from logstash and echo it over websocket to all connected clients
router.post('/', function(req, res){
  let body = req.body;
  getWss().clients.forEach(function (client) {
    client.send(JSON.stringify(body, null, 4));
  });
  res.status(200).end();
});

export default router;
