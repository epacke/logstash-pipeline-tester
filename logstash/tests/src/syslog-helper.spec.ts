import { addSyslogPri } from './helpers/syslog';

describe('addSyslogPri', () => {
  it('Adds PRI based on severity with facility local0 by default', () => {
    expect(addSyslogPri('Nov  4 02:29:16 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool'))
      .toEqual('<131>Nov  4 02:29:16 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool');
    expect(addSyslogPri('Nov  4 02:29:16 bigip1 notice tmm2[19781]: 01010028:3: Re-enabling general logging; held 18 messages.'))
      .toEqual('<133>Nov  4 02:29:16 bigip1 notice tmm2[19781]: 01010028:3: Re-enabling general logging; held 18 messages.');
  })

  it('Uses the given facility', () => {
    expect(addSyslogPri('Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING', 'syslog'))
      .toEqual('<44>Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING');
    expect(addSyslogPri('Mar 23 14:23:01 bigip.xip.se info dhclient[4405]: XMT', 3))
      .toEqual('<30>Mar 23 14:23:01 bigip.xip.se info dhclient[4405]: XMT');
  })

  it('Leaves lines that already have a PRI unchanged', () => {
    expect(addSyslogPri('<44>Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING'))
      .toEqual('<44>Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING');
  })

  it('Throws on unknown severity or facility', () => {
    expect(() => addSyslogPri('Nov  4 02:29:16 bigip1 bogus tmm2[19781]: message')).toThrow();
    expect(() => addSyslogPri('not a syslog line')).toThrow();
    expect(() => addSyslogPri('Nov  4 02:29:16 bigip1 err tmm2[19781]: message', 'local9')).toThrow();
  })
})
