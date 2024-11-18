// Send data to a logstash pipeline using TCP
import net from 'net';
import {LOGSTASH} from '../../../constants/LogstashAddress';
import logger from '../../../util/Logger';

function sendTCP(payload: string, port: number) {
  const conn = net.createConnection({host: LOGSTASH, port: port}, function() {
    conn.write(payload);
  }).on('error', function(err) {
    logger.error(`Failed to send payload to ${port}. 
    Has all logstash pipelines started successfully?`);
  });
}

export default sendTCP;
