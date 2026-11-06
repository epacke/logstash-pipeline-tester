import { readFileSync } from 'fs';
import path from 'path';
import { ProcessLogLine } from '.';
import { addSyslogPri } from './syslog';

const F5_PORT = '5245';
const F5_RSYSLOG_PORT = '5246';
const FIXTURE_DIR = path.join(__dirname, '..', '..', 'fixtures', 'f5');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// <133>Nov  5 02:08:32 bigip1 ...
const CLASSIC_TIMESTAMP = /^(<\d{1,3}>)(\w{3})\s+(\d{1,2}) (\d{2}:\d{2}:\d{2}) /;

/**
 * Sends a raw BIG-IP log line (as found in /var/log/*) to the f5-syslog
 * pipeline and returns the resulting event.
 * The <PRI> header that remote syslog adds is put back first.
 * @param line Raw log line
 * @param facility Defaults to local0, which is used by both ltm and audit
 */
export async function sendF5(line: string, facility: string = 'local0') {
  const rawResponse = await ProcessLogLine(addSyslogPri(line, facility), F5_PORT, 'TCP');
  return JSON.parse(rawResponse);
}

/**
 * Rewrites a raw BIG-IP log line into the format rsyslog writes with the
 * template in pipeline/f5-rsyslog/README.md: <PRI> followed by an RFC 3339
 * timestamp. Lines that already have a <PRI> but no BIG-IP timestamp are
 * returned unchanged.
 * @param line Raw log line
 * @param facility Defaults to local0, which is used by both ltm and audit
 * @param year The BIG-IP timestamp has no year
 * @param offset The BIG-IP timestamp has no time zone
 */
export function toRsyslogFormat(line: string, facility: string = 'local0', year = 2026, offset = '+01:00'): string {
  return addSyslogPri(line, facility).replace(CLASSIC_TIMESTAMP, (_, pri, month, day, time) => {
    const monthNumber = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
    return `${pri}${year}-${monthNumber}-${day.padStart(2, '0')}T${time}${offset} `;
  });
}

/**
 * Sends a raw BIG-IP log line to the f5-rsyslog pipeline, rewritten with
 * toRsyslogFormat, and returns the resulting event.
 * @param line Raw log line, or a line already in rsyslog format
 * @param facility Defaults to local0, which is used by both ltm and audit
 */
export async function sendF5Rsyslog(line: string, facility: string = 'local0') {
  const rawResponse = await ProcessLogLine(toRsyslogFormat(line, facility), F5_RSYSLOG_PORT, 'TCP');
  return JSON.parse(rawResponse);
}

/**
 * Reads log lines from tests/fixtures/f5/<name>, skipping comments and blank lines
 * @param name File name, e.g. ltm.log
 */
export function readF5Fixture(name: string): string[] {
  return readFileSync(path.join(FIXTURE_DIR, name), 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'));
}
