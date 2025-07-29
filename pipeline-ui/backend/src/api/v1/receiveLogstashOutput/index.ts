import express from 'express';
import {getWss} from '../../../index';
import { websocketLogger } from '../../../util/Logger';

const router = express.Router();

// Receive data from logstash and echo it over websocket to all connected clients
router.post('/', function(req, res) {
  try {
    const body = req.body;
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      websocketLogger.error({
        message: 'Invalid request body received from Logstash',
        body: body,
      });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const wss = getWss();
    const clients = Array.from(wss.clients);
    
    if (clients.length === 0) {
      websocketLogger.warn('No WebSocket clients connected to receive Logstash output');
    }

    // Stringify the body once for all clients
    let jsonString: string;
    try {
      jsonString = JSON.stringify(body, null, 4);
    } catch (err) {
      websocketLogger.error({
        message: 'Failed to stringify Logstash output',
        error: err instanceof Error ? err.message : 'Unknown error',
        body: body,
      });
      return res.status(500).json({ error: 'Failed to process Logstash output' });
    }

    // Send to all connected clients
    let sentCount = 0;
    clients.forEach(client => {
      try {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(jsonString);
          sentCount++;
        } else {
          websocketLogger.warn({
            message: 'Skipping non-ready WebSocket client',
            readyState: client.readyState,
          });
        }
      } catch (err) {
        websocketLogger.error({
          message: 'Failed to send data to WebSocket client',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    });

    websocketLogger.debug({
      message: 'Processed Logstash output',
      clientCount: clients.length,
      sentCount: sentCount,
    });

    res.status(200).end();
  } catch (err) {
    websocketLogger.error({
      message: 'Unexpected error processing Logstash output',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
