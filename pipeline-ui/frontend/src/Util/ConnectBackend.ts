
const BackendConnection = async (setBackendConnected: (status: boolean) => void , handleLogStashResult: (messages: string) => void) => {

  let ws: WebSocket;
  try {
    ws = await new WebSocket('ws://localhost:8080/getLogs');
  } catch (err) {
    console.error("Unable to connect to the backend")
    throw "Unable to connec to the backend";
  }

  ws.onopen = function() {
    setBackendConnected(true);
  };

  ws.onmessage = function (evt) {
    handleLogStashResult(evt.data);
  };

  ws.onerror = function (err) {
    console.error('Socket encountered error: ', err, 'Closing socket');
    ws.close();
  }

  ws.onclose = function() {

  };

  ws.onclose = function() {
    setBackendConnected(false);
    let t = setInterval(async () => {
      try {
        await BackendConnection(setBackendConnected, handleLogStashResult);
        clearInterval(t);
      } catch (e) {
        console.error("Reconnect failed");
        throw "Reconnect failed"
      };
    }, 1000);
  };


}

export default BackendConnection;
