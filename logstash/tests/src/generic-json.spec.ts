import {ProcessLogLine} from './helpers';

/**
 * Sends a message to logstash
 * Deletes dynamic data
 * Returns the result
 * @param message
 */
const send = async (message: Object) => {
  const rawResponse = await ProcessLogLine(JSON.stringify(message), '5060', 'TCP');
  return JSON.parse(rawResponse);
}

describe('Generic JSON tests', () => {
  it('JSON data should be sent back', async () => {
    const data = await send({"type": "generic-json", "key": "value"});
    const { token, key, type } = data;

    expect(token).toEqual('abc1234');
    expect(key).toEqual('value');
    expect(type).toEqual('generic-json');
  })
})