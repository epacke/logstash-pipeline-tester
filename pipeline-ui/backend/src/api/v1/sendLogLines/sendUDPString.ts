// Send data to a logstash pipeline using UDP
import dgram from 'dgram';
import {LOGSTASH} from '../../../constants/LogstashAddress';

function sendUDP(payload: string, port: number) {
  const message = new Buffer(payload);

  const client = dgram.createSocket('udp4');
  client.send(message, 0, message.length, port, LOGSTASH, function(err, bytes) {
    if (err) throw err;
    client.close();
  });
}

export default sendUDP;
