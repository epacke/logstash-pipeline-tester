import WebSocket from 'ws';
import axios from 'axios';

export async function ProcessLogLine(
  logLines: string,
  port: string,
  protocol: string,
) {
  return new Promise<string> (async (resolve) => {
    const ws = await GetBackendConnection();

    let data;
    ws.onmessage = function(evt) {
      data = evt.data;
      ws.close();
    };

    ws.onclose = function() {
      resolve(data);
    }

    await axios.post(
      `http://localhost:8080/api/v1/sendLogLines`,{sendString: logLines, port, protocol},
    );
  });
}

const GetBackendConnection = async () => {
  return new Promise<WebSocket>( (resolve) => {
    let ws: WebSocket;
    try {
      ws = new WebSocket('ws://localhost:8080/api/v1/getLogstashOutput');
    } catch (err) {
      console.error('Unable to connect to the backend');
      console.log(err);
    }

    ws.onopen = function() {
      resolve(ws);
    };
  })
}

