/*
 Examples (raw lines as found in the BIG-IP log files, without <PRI>):
 Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'
 Mar 23 14:23:01 bigip.xip.se info dhclient[4405]: XMT: Solicit on mgmt, interval 111970ms.
 Mar 23 14:22:01 bigip.xip.se info CROND[23189]: (syscheck) CMD (/usr/bin/system_check -q)
 Nov  4 02:29:16 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool
 */

import { ProcessLogLine } from './helpers';
import { addSyslogPri } from './helpers/syslog';

/**
 * Adds the <PRI> header the F5 sends over the wire and sends the line to logstash
 * @param message Raw log line
 * @param facility Defaults to local0 (ltm)
 */
const sendF5 = async (message: string, facility: string = 'local0') => {
  const rawResponse = await ProcessLogLine(addSyslogPri(message, facility), '5245', 'TCP');
  return JSON.parse(rawResponse);
}

describe('F5 syslog tests', () => {
  it('Type should be f5-syslog', async () => {
    const data = await sendF5(`Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'`, 'syslog');
    const { type, syslog_pri, syslog_hostname, syslog_severity, syslog_message, syslog_timestamp, syslog_program } = data;

    expect(type).toEqual('f5-syslog');
    expect(syslog_pri).toEqual('44');
    expect(syslog_hostname).toEqual('bigip.xip.se');
    expect(syslog_severity).toEqual('warning');
    expect(syslog_message).toEqual('WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value=\'\', new_value=\'.journald.\'');
    expect(syslog_timestamp).toEqual('Mar 23 14:21:41');
    expect(syslog_program).toEqual('syslog-ng');
  })

  it('Parses tmm syslog header', async () => {
    const data = await sendF5('Nov  4 02:29:16 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool');
    const { syslog_pri, syslog_hostname, syslog_severity, syslog_message, syslog_timestamp, syslog_program, syslog_pid } = data;

    expect(syslog_pri).toEqual('131');
    expect(syslog_hostname).toEqual('bigip1');
    expect(syslog_severity).toEqual('err');
    expect(syslog_timestamp).toEqual('Nov  4 02:29:16');
    expect(syslog_program).toEqual('tmm2');
    expect(syslog_pid).toEqual('19781');
    expect(syslog_message).toEqual('01010028:3: No members available for pool /Common/ipv6pool');
  })

  it('Maps notice severity from PRI', async () => {
    const data = await sendF5('Nov  4 02:29:16 bigip1 notice tmm1[19781]: 01010028:3: Re-enabling general logging; held 18 messages.');
    const { syslog_pri, syslog_severity, syslog_program } = data;

    expect(syslog_pri).toEqual('133');
    expect(syslog_severity).toEqual('notice');
    expect(syslog_program).toEqual('tmm1');
  })
})
