// Send data to a logstash pipeline using UDP
import dgram from 'dgram';
import {LOGSTASH} from '../../../constants/LogstashAddress';
import { pipelineLogger } from '../../../util/Logger';
import config from '../../../constants/config';

function sendUDP(payload: string, port: number, retries = 0) {
  const message = Buffer.from(payload);
  const client = dgram.createSocket('udp4');

  // Handle socket errors
  client.on('error', (err) => {
    pipelineLogger.error({
      message: `UDP socket error on port ${port}`,
      details: err.message,
    });
    cleanup();
  });

  // Set socket timeout
  const timeout = setTimeout(() => {
    pipelineLogger.error({
      message: `UDP send timeout on port ${port}`,
    });
    cleanup();
  }, config.retryWaitTimeSeconds * 1000);

  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeout);
    try {
      client.close();
    } catch (err) {
      pipelineLogger.error({
        message: `Error closing UDP socket on port ${port}`,
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  client.send(message, 0, message.length, port, LOGSTASH, (err, bytes) => {
    clearTimeout(timeout);
    
    if (err) {
      pipelineLogger.error({
        message: `Failed to send UDP payload to ${port}. ` +
          `Has all logstash pipelines started successfully?`,
        payload,
        details: err.message,
      });
      
      cleanup();
      
      setTimeout(() => {
        if (retries >= config.maxRetries) {
          pipelineLogger.error({
            message: `Gave up sending UDP payload to ${port}. Max retries reached.`,
            payload,
            details: err.message,
          });
          return;
        }
        pipelineLogger.info({
          message: `Retrying UDP send to port ${port}`,
          attempt: retries + 1,
          maxAttempts: config.maxRetries,
        });
        sendUDP(payload, port, retries + 1);
      }, config.retryWaitTimeSeconds * 1000);
    } else {
      pipelineLogger.debug({
        message: `Successfully sent UDP payload to port ${port}`,
        bytesSent: bytes,
      });
      cleanup();
    }
  });
}

export default sendUDP;
