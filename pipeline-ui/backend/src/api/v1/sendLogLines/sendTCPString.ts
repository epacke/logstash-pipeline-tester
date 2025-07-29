// Send data to a logstash pipeline using TCP
import net from 'net';
import {LOGSTASH} from '../../../constants/LogstashAddress';
import { pipelineLogger } from '../../../util/Logger';
import config from '../../../constants/config';

function sendTCP(payload: string, port: number, retries = 0) {
  const client = new net.Socket();
  let isConnected = false;

  // Handle connection errors
  client.on('error', (err) => {
    pipelineLogger.error({
      message: `TCP connection error on port ${port}`,
      details: err.message,
    });
    cleanup();
  });

  // Set connection timeout
  const timeout = setTimeout(() => {
    pipelineLogger.error({
      message: `TCP connection timeout on port ${port}`,
    });
    cleanup();
  }, config.retryWaitTimeSeconds * 1000);

  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeout);
    if (isConnected) {
      try {
        client.end();
      } catch (err) {
        pipelineLogger.error({
          message: `Error closing TCP connection on port ${port}`,
          details: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  };

  client.connect(port, LOGSTASH, () => {
    clearTimeout(timeout);
    isConnected = true;
    
    client.write(payload, (err) => {
      if (err) {
        pipelineLogger.error({
          message: `Failed to write TCP payload to ${port}`,
          payload,
          details: err.message,
        });
        cleanup();
        
        setTimeout(() => {
          if (retries >= config.maxRetries) {
            pipelineLogger.error({
              message: `Gave up sending TCP payload to ${port}. Max retries reached.`,
              payload,
              details: err.message,
            });
            return;
          }
          pipelineLogger.info({
            message: `Retrying TCP send to port ${port}`,
            attempt: retries + 1,
            maxAttempts: config.maxRetries,
          });
          sendTCP(payload, port, retries + 1);
        }, config.retryWaitTimeSeconds * 1000);
      } else {
        pipelineLogger.debug({
          message: `Successfully sent TCP payload to port ${port}`,
          bytesSent: payload.length,
        });
        cleanup();
      }
    });
  });
}

export default sendTCP;
