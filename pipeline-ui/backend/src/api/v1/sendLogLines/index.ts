import express from 'express';
import sendTCP from './sendTCPString';
import sendUDP from './sendUDPString';
import {pipelineLogger} from '../../../util/Logger';
import {z} from 'zod';

const router = express.Router();

// Define input validation schema
const SendLogLinesSchema = z.object({
  sendString: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(['TCP', 'UDP']),
});

// Receive lines from the web ui
router.post('/', function(req, res) {
  try {
    // Parse and validate input
    const result = SendLogLinesSchema.safeParse({
      ...req.body,
      port: Number(req.body.port),
    });

    if (!result.success) {
      pipelineLogger.error({
        message: 'Invalid request body',
        errors: result.error.errors,
        body: req.body,
      });
      return res.status(400).json({
        error: 'Invalid request body',
        details: result.error.errors,
      });
    }

    const {sendString, port, protocol} = result.data;

    // Process the request
    const processedString = `${sendString}\n`;
    if (protocol === 'TCP') {
      sendTCP(processedString, port);
    } else {
      sendUDP(processedString, port);
    }

    res.status(200).end();
  } catch (err) {
    pipelineLogger.error({
      message: 'Error processing sendLogLines request',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    res.status(500).json({error: 'Internal server error'});
  }
});

export default router;
