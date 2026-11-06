import { addSyslogPri, toRsyslogFormat } from './helpers/syslog';

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

describe('toRsyslogFormat', () => {
  const line = 'Nov  5 02:08:24 bigip1 notice mcpd[5217]: 01070638:5: Pool /Common/lpt_pool member /Common/192.0.2.1:80 monitor status down.';

  it('Adds PRI and an RFC 3339 timestamp', () => {
    expect(toRsyslogFormat(line, { year: 2026, timeZone: 'Europe/Stockholm' }))
      .toEqual('<133>2026-11-05T02:08:24+01:00 bigip1 notice mcpd[5217]: 01070638:5: Pool /Common/lpt_pool member /Common/192.0.2.1:80 monitor status down.');
  })

  it('Uses the offset in effect on that date', () => {
    expect(toRsyslogFormat('Jul  1 12:00:00 bigip1 info tmm[1]: summer', { year: 2026, timeZone: 'Europe/Stockholm' }))
      .toEqual('<134>2026-07-01T12:00:00+02:00 bigip1 info tmm[1]: summer');
    expect(toRsyslogFormat('Jul  1 12:00:00 bigip1 info tmm[1]: utc', { year: 2026, timeZone: 'UTC' }))
      .toEqual('<134>2026-07-01T12:00:00+00:00 bigip1 info tmm[1]: utc');
    expect(toRsyslogFormat('Jul  1 12:00:00 bigip1 info tmm[1]: west', { year: 2026, timeZone: 'America/New_York' }))
      .toEqual('<134>2026-07-01T12:00:00-04:00 bigip1 info tmm[1]: west');
  })

  it('Uses a fixed offset and facility when given', () => {
    expect(toRsyslogFormat('Jul  1 12:00:00 bigip1 info tmm[1]: fixed', { year: 2026, offset: '+05:30', facility: 'local1' }))
      .toEqual('<142>2026-07-01T12:00:00+05:30 bigip1 info tmm[1]: fixed');
  })

  it('Keeps an existing PRI', () => {
    expect(toRsyslogFormat('<44>Mar 23 14:21:41 bigip1 warning syslog-ng[2584]: WARNING', { year: 2026, offset: '+01:00' }))
      .toEqual('<44>2026-03-23T14:21:41+01:00 bigip1 warning syslog-ng[2584]: WARNING');
  })

  it('Throws on lines without a BIG-IP timestamp and on bad offsets', () => {
    expect(() => toRsyslogFormat('<133>2026-11-05T02:08:24+01:00 bigip1 notice mcpd[5217]: already converted')).toThrow();
    expect(() => toRsyslogFormat(line, { offset: '+1' })).toThrow();
  })
})
