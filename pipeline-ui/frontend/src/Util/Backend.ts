const {protocol, host} = window.location;
const wsProtocol = protocol === 'https:' ? 'wss': 'ws';

const webSocketsBackend = `${wsProtocol}://${host}`;
const Backend = `${protocol}//${host}`;

export {Backend, webSocketsBackend};
