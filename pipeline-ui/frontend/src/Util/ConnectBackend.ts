import {webSocketsBackend} from './Backend';

const BackendConnection = async (setBackendConnected: (status: boolean) => void,
  handleLogStashResult: (messages: string) => void) => {
  let ws: WebSocket;
  try {
    ws = await new WebSocket(`${webSocketsBackend}/api/v1/getLogstashOutput`);
  } catch (_err) {
    console.error('Unable to connect to the backend');
    throw new Error('Unable to connect to the backend');
  }

  ws.onopen = function() {
    setBackendConnected(true);
  };

  ws.onmessage = function(evt) {
    handleLogStashResult(evt.data);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err, 'Closing socket');
    ws.close();
  };

  ws.onclose = function() {
    setBackendConnected(false);
    const t = setInterval(async () => {
      try {
        await BackendConnection(setBackendConnected, handleLogStashResult);
        clearInterval(t);
      } catch (_e) {
        console.error('Reconnect failed');
        throw new Error('Reconnect failed');
      }
    }, 1000);
  };
};

export default BackendConnection;
