/*
 Examples:
 <44>Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'
 <30>Mar 23 14:23:01 bigip.xip.se info dhclient[4405]: XMT: Solicit on mgmt, interval 111970ms.
 <78>Mar 23 14:22:01 bigip.xip.se info CROND[23189]: (syscheck) CMD (/usr/bin/system_check -q)
 */

import { ProcessLogLine } from './helpers';

const sendF5 = async (message: string) => {
  const rawResponse = await ProcessLogLine(message, '5245', 'TCP');
  return JSON.parse(rawResponse);
}

describe('F5 syslog tests', () => {
  it('Type should be f5-syslog', async () => {
    const data = await sendF5(`<44>Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'`);
    const { type, syslog_hostname, syslog_severity, syslog_message, syslog_timestamp, syslog_program } = data;

    expect(type).toEqual('f5-syslog');
    expect(syslog_hostname).toEqual('bigip.xip.se');
    expect(syslog_severity).toEqual('warning');
    expect(syslog_message).toEqual('WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value=\'\', new_value=\'.journald.\'');
    expect(syslog_timestamp).toEqual('Mar 23 14:21:41');
    expect(syslog_program).toEqual('syslog-ng');
  })
})