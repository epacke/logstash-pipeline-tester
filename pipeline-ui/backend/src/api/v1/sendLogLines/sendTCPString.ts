// Send data to a logstash pipeline using TCP
import net from 'net';
import {LOGSTASH} from '../../../constants/LogstashAddress';
import logger from '../../../util/Logger';
import config from '../../../constants/config';

function sendTCP(payload: string, port: number, retries = 0) {
  const conn = net.createConnection({host: LOGSTASH, port: port}, function() {
    conn.write(payload);
  }).on('error', function(err) {
    logger.error({
      message: `Failed to send payload to ${port}.` +
        `Has all logstash pipelines started successfully?`,
      payload,
      details: err.message,
    });
    setTimeout(() => {
      if (retries > config.maxRetries) {
        logger.error({
          message: `Gave up sending payload to ${port}. Timeout reached.`,
          payload,
          details: err.message,
        });
        return;
      }
      logger.info(`Retrying sending payload to port ${port}`);
      sendTCP(payload, port, ++retries);
    }, config.retryWaitTimeSeconds * 1000);
  });
}

export default sendTCP;
