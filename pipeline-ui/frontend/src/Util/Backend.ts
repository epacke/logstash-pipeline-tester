const {protocol, host} = window.location;
const wsProtocol = protocol === 'https:' ? 'wss': 'ws';

const {NODE_ENV} = process.env;
const backendHost = NODE_ENV === 'development' ? 'localhost:8080': host;
const webSocketsBackend = `${wsProtocol}://${backendHost}`;
const Backend = `${protocol}//${backendHost}`;

export {Backend, webSocketsBackend};
