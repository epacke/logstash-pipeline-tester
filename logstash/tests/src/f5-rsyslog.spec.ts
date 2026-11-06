/*
 Tests for the syslog header part of the f5-rsyslog pipeline
 (logstash-config/pipeline/f5-rsyslog/filter.conf, syslog header section) and a sweep
 over all fixture lines in tests/fixtures/f5-rsyslog.
 */

import { readF5RsyslogFixture, sendF5Rsyslog } from './helpers/f5';

describe('F5 rsyslog header', () => {
  it('Maps the header to ECS', async () => {
    const event = await sendF5Rsyslog('<131>2026-11-04T02:29:16+01:00 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool');

    expect(event).toMatchObject({
      host: { hostname: 'bigip1' },
      log: {
        level: 'err',
        syslog: {
          priority: 131,
          facility: { code: 16, name: 'local0' },
          severity: { code: 3, name: 'error' },
        },
      },
      process: { name: 'tmm2', pid: 19781 },
      event: {
        code: '01010028',
        dataset: 'f5.ltm',
        original: '<131>2026-11-04T02:29:16+01:00 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool',
      },
      observer: { vendor: 'F5', product: 'BIG-IP' },
      message: 'No members available for pool /Common/ipv6pool',
    });
    // Year and offset come from the RFC 3339 timestamp
    expect(event['@timestamp']).toEqual('2026-11-04T01:29:16.000Z');
    expect(event.tags).toBeUndefined();
  });

  it('Handles lines without a message ID', async () => {
    const event = await sendF5Rsyslog('<134>2026-11-05T02:09:55+01:00 bigip1 info tmm1[19781]: Rule /Common/lpt_irule <HTTP_REQUEST>: lpt request /hello from 192.0.2.163');

    expect(event.event.code).toBeUndefined();
    expect(event.message).toEqual('Rule /Common/lpt_irule <HTTP_REQUEST>: lpt request /hello from 192.0.2.163');
  });

  it('Handles process names with parentheses', async () => {
    const event = await sendF5Rsyslog('<134>2026-11-03T07:34:30+01:00 localhost.localdomain info sshd(pam_audit)[10545]: 01070417:6: AUDIT - user root - RAW: sshd(pam_audit): user=root(root) partition=[All] level=Administrator tty=ssh host=192.0.2.163 attempts=1 start="Tue Nov  3 07:34:30 2026".');

    expect(event.process).toEqual({ name: 'sshd(pam_audit)', pid: 10545 });
    expect(event.host.hostname).toEqual('localhost.localdomain');
  });

  it('Handles process names without pid', async () => {
    const event = await sendF5Rsyslog('<134>2026-11-04T02:24:04+01:00 localhost info logger: 01010044:5: Example without pid');

    expect(event.process).toEqual({ name: 'logger' });
    expect(event.event.code).toEqual('01010044');
  });

  // Format kept from the previous pipeline, not verified on VIPRION hardware
  it('Reads the VIPRION slot prefix', async () => {
    const event = await sendF5Rsyslog('<131>2026-11-04T02:29:16+01:00 slot1/bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool');

    expect(event.host.hostname).toEqual('bigip1');
    expect(event.f5.slot).toEqual('1');
  });

  it('Puts AUDIT messages on local0 in the audit dataset', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-04T02:27:24+01:00 bigip1 notice tmm2[19781]: 013e000d:5: AUDIT - The DB variable tcpdump.sslprovider has been disabled.');

    expect(event.event.dataset).toEqual('f5.audit');
  });

  it('Sets no dataset for other facilities', async () => {
    const event = await sendF5Rsyslog(`<44>2026-03-23T14:21:41+01:00 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'`);

    expect(event).toMatchObject({
      host: { hostname: 'bigip.xip.se' },
      log: { level: 'warning', syslog: { facility: { name: 'syslogd' } } },
      process: { name: 'syslog-ng', pid: 2584 },
    });
    expect(event.event.dataset).toBeUndefined();
  });

  it('Uses the time zone offset in the timestamp', async () => {
    const event = await sendF5Rsyslog('<133>2026-07-01T12:00:00+02:00 bigip1 notice tmm3[19781]: 01010221:5: Pool /Common/lpt_pool now has available members');

    expect(event['@timestamp']).toEqual('2026-07-01T10:00:00.000Z');
  });

  it('Maps lines from other daemons', async () => {
    const event = await sendF5Rsyslog('<30>2026-11-06T00:59:02+01:00 myhostname.ltm info systemd[1]: Started Third Party EDR Monitoring Service.');

    expect(event).toMatchObject({
      '@timestamp': '2026-11-05T23:59:02.000Z',
      host: { hostname: 'myhostname.ltm' },
      log: { syslog: { facility: { name: 'daemon' } } },
      process: { name: 'systemd', pid: 1 },
      message: 'Started Third Party EDR Monitoring Service.',
    });
    expect(event.event.dataset).toBeUndefined();
  });

  it('Tags lines with the BIG-IP timestamp', async () => {
    const event = await sendF5Rsyslog('<133>Nov  5 02:08:32 bigip1 notice tmm3[19781]: 01010221:5: Pool /Common/lpt_pool now has available members');

    expect(event.tags).toEqual(['_f5_header_parse_failure']);
  });

  it('Tags lines it can not parse', async () => {
    const event = await sendF5Rsyslog('<133>This is not a BIG-IP log line');

    expect(event.tags).toEqual(['_f5_header_parse_failure']);
    expect(event.message).toEqual('<133>This is not a BIG-IP log line');
  });
});

describe('F5 rsyslog fixture lines', () => {
  it.each(readF5RsyslogFixture('ltm.log'))('ltm: %s', async (line) => {
    const event = await sendF5Rsyslog(line);

    expect(event.event.dataset).toEqual('f5.ltm');
    expect(event.tags).toBeUndefined();
  });

  it.each(readF5RsyslogFixture('audit.log'))('audit: %s', async (line) => {
    const event = await sendF5Rsyslog(line);

    expect(event.event.dataset).toEqual('f5.audit');
    expect(event.tags).toBeUndefined();
  });
});
