/*
 Tests for the syslog header part of the f5-syslog pipeline
 (logstash-config/pipeline/f5-syslog/10-syslog-header.conf) and a sweep
 over all fixture lines in tests/fixtures/f5.
 */

import { readF5Fixture, sendF5 } from './helpers/f5';

describe('F5 syslog header', () => {
  it('Maps the header to ECS', async () => {
    const event = await sendF5('Nov  4 02:29:16 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool');

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
        original: '<131>Nov  4 02:29:16 bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool',
      },
      observer: { vendor: 'F5', product: 'BIG-IP' },
      message: 'No members available for pool /Common/ipv6pool',
    });
    // The year is guessed by Logstash and the BIG-IP time zone defaults to UTC
    expect(event['@timestamp']).toMatch(/-11-04T02:29:16\.000Z$/);
    expect(event.tags).toBeUndefined();
  });

  it('Handles lines without a message ID', async () => {
    const event = await sendF5('Nov  5 02:09:55 bigip1 info tmm1[19781]: Rule /Common/lpt_irule <HTTP_REQUEST>: lpt request /hello from 192.0.2.163');

    expect(event.event.code).toBeUndefined();
    expect(event.message).toEqual('Rule /Common/lpt_irule <HTTP_REQUEST>: lpt request /hello from 192.0.2.163');
  });

  it('Handles process names with parentheses', async () => {
    const event = await sendF5('Nov  3 07:34:30 localhost.localdomain info sshd(pam_audit)[10545]: 01070417:6: AUDIT - user root - RAW: sshd(pam_audit): user=root(root) partition=[All] level=Administrator tty=ssh host=192.0.2.163 attempts=1 start="Tue Nov  3 07:34:30 2026".');

    expect(event.process).toEqual({ name: 'sshd(pam_audit)', pid: 10545 });
    expect(event.host.hostname).toEqual('localhost.localdomain');
  });

  it('Handles process names without pid', async () => {
    const event = await sendF5('Nov  4 02:24:04 localhost info logger: 01010044:5: Example without pid');

    expect(event.process).toEqual({ name: 'logger' });
    expect(event.event.code).toEqual('01010044');
  });

  // Format kept from the previous pipeline, not verified on VIPRION hardware
  it('Reads the VIPRION slot prefix', async () => {
    const event = await sendF5('Nov  4 02:29:16 slot1/bigip1 err tmm2[19781]: 01010028:3: No members available for pool /Common/ipv6pool');

    expect(event.host.hostname).toEqual('bigip1');
    expect(event.f5.slot).toEqual('1');
  });

  it('Puts AUDIT messages on local0 in the audit dataset', async () => {
    const event = await sendF5('Nov  4 02:27:24 bigip1 notice tmm2[19781]: 013e000d:5: AUDIT - The DB variable tcpdump.sslprovider has been disabled.');

    expect(event.event.dataset).toEqual('f5.audit');
  });

  it('Sets no dataset for other facilities', async () => {
    const event = await sendF5(`Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'`, 'syslog');

    expect(event).toMatchObject({
      host: { hostname: 'bigip.xip.se' },
      log: { level: 'warning', syslog: { facility: { name: 'syslogd' } } },
      process: { name: 'syslog-ng', pid: 2584 },
    });
    expect(event.event.dataset).toBeUndefined();
  });

  it('Tags lines it can not parse', async () => {
    const event = await sendF5('<133>This is not a BIG-IP log line');

    expect(event.tags).toEqual(['_f5_header_parse_failure']);
    expect(event.message).toEqual('<133>This is not a BIG-IP log line');
  });
});

describe('F5 fixture lines', () => {
  it.each(readF5Fixture('ltm.log'))('ltm: %s', async (line) => {
    const event = await sendF5(line);

    expect(event.event.dataset).toEqual('f5.ltm');
    expect(event.tags).toBeUndefined();
  });

  it.each(readF5Fixture('audit.log'))('audit: %s', async (line) => {
    const event = await sendF5(line);

    expect(event.event.dataset).toEqual('f5.audit');
    expect(event.tags).toBeUndefined();
  });
});

describe('F5 through the syslog input', () => {
  // The syslog input adds the sender's address and a service type,
  // otherwise the events must be the same as from the tcp input.
  it.each([...readF5Fixture('ltm.log'), ...readF5Fixture('audit.log')])('%s', async (line) => {
    const viaTcp = await sendF5(line);
    const viaSyslog = await sendF5(line, 'local0', 'syslog');

    expect(viaSyslog.host.ip).toBeDefined();
    expect(viaSyslog.service).toEqual({ type: 'system' });
    delete viaSyslog.host.ip;
    delete viaSyslog.service;
    expect(viaSyslog).toEqual(viaTcp);
  });
});
