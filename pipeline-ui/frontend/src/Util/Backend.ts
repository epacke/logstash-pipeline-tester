const {protocol, host} = window.location;
const wsProtocol = protocol === 'https:' ? 'wss': 'ws';

const backendHost = import.meta.env.MODE === 'development' ? 'localhost:8080': host;
const webSocketsBackend = `${wsProtocol}://${backendHost}`;
const Backend = `${protocol}//${backendHost}`;

export {Backend, webSocketsBackend};
