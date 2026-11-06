/*
 Tests for the f5-rsyslog pipeline (logstash-config/pipeline/f5-rsyslog).
 It's a copy of f5-syslog with another timestamp format, so the header is
 tested here and every fixture line is checked to give the same event as
 f5-syslog.
 */

import { ProcessLogLine } from './helpers';
import { readF5Fixture, sendF5, sendF5Rsyslog, toRsyslogFormat } from './helpers/f5';

describe('F5 rsyslog header', () => {
  it('Maps the header to ECS', async () => {
    const event = await sendF5Rsyslog('<30>2026-11-06T00:59:02+01:00 myhostname.ltm info systemd[1]: Started Third Party EDR Monitoring Service.');

    expect(event).toMatchObject({
      '@timestamp': '2026-11-05T23:59:02.000Z',
      host: { hostname: 'myhostname.ltm' },
      log: {
        level: 'info',
        syslog: {
          priority: 30,
          facility: { code: 3, name: 'daemon' },
          severity: { code: 6, name: 'informational' },
        },
      },
      process: { name: 'systemd', pid: 1 },
      event: {
        original: '<30>2026-11-06T00:59:02+01:00 myhostname.ltm info systemd[1]: Started Third Party EDR Monitoring Service.',
      },
      observer: { vendor: 'F5', product: 'BIG-IP' },
      message: 'Started Third Party EDR Monitoring Service.',
    });
    // Not local0, so neither ltm nor audit
    expect(event.event.dataset).toBeUndefined();
    expect(event.tags).toBeUndefined();
  });

  it('Uses the time zone offset in the timestamp', async () => {
    const event = await sendF5Rsyslog('<133>2026-07-01T12:00:00+02:00 bigip1 notice tmm3[19781]: 01010221:5: Pool /Common/lpt_pool now has available members');

    expect(event['@timestamp']).toEqual('2026-07-01T10:00:00.000Z');
    expect(event.event).toMatchObject({ dataset: 'f5.ltm', action: 'pool-members-available' });
  });

  it('Tags lines with the BIG-IP timestamp', async () => {
    // Sent as is, sendF5Rsyslog would rewrite the timestamp
    const event = JSON.parse(await ProcessLogLine('<133>Nov  5 02:08:32 bigip1 notice tmm3[19781]: 01010221:5: Pool /Common/lpt_pool now has available members', '5246', 'TCP'));

    expect(event.tags).toEqual(['_f5_header_parse_failure']);
  });
});

describe('F5 rsyslog fixture lines', () => {
  // f5-syslog reads the BIG-IP timestamp as UTC, toRsyslogFormat adds +01:00
  it.each([...readF5Fixture('ltm.log'), ...readF5Fixture('audit.log')])('%s', async (line) => {
    const viaSyslog = await sendF5(line);
    const viaRsyslog = await sendF5Rsyslog(line);

    expect(viaRsyslog.event.original).toEqual(toRsyslogFormat(line));
    expect(Date.parse(viaRsyslog['@timestamp'])).toEqual(Date.parse(viaSyslog['@timestamp']) - 60 * 60 * 1000);
    for (const event of [viaSyslog, viaRsyslog]) {
      delete event['@timestamp'];
      delete event.event.original;
    }
    expect(viaRsyslog).toEqual(viaSyslog);
  });
});
