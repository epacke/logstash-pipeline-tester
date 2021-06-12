// Send data to a logstash pipeline using TCP
import net from 'net';
import {LOGSTASH} from '../../../util/LogstashAddress';

function sendTCP(payload: string, port: number) {
  const conn = net.createConnection({host: LOGSTASH, port: port}, function() {
    conn.write(payload);
  })
      .on('error', function(err) {
        console.error(`Failed to send payload to ${port}. 
        Has all logstash pipelines started successfully?`);
      });
}

export default sendTCP;
