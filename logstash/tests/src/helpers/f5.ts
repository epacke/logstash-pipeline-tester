import { readFileSync } from 'fs';
import path from 'path';
import { ProcessLogLine } from '.';
import { addSyslogPri } from './syslog';

const F5_SYSLOG_PORT = '5245';
const F5_RSYSLOG_PORT = '5246';
const FIXTURE_DIR = path.join(__dirname, '..', '..', 'fixtures');

/**
 * Sends a raw BIG-IP log line (as found in /var/log/*) to the f5-syslog
 * pipeline and returns the resulting event.
 * The <PRI> header that remote syslog adds is put back first.
 * @param line Raw log line
 * @param facility Defaults to local0, which is used by both ltm and audit
 */
export async function sendF5(line: string, facility: string = 'local0') {
  const rawResponse = await ProcessLogLine(addSyslogPri(line, facility), F5_SYSLOG_PORT, 'TCP');
  return JSON.parse(rawResponse);
}

/**
 * Sends a line as written by rsyslog (<PRI> and an RFC 3339 timestamp, see
 * pipeline/f5-rsyslog/README.md) to the f5-rsyslog pipeline as is and returns
 * the resulting event.
 * @param line Log line
 */
export async function sendF5Rsyslog(line: string) {
  const rawResponse = await ProcessLogLine(line, F5_RSYSLOG_PORT, 'TCP');
  return JSON.parse(rawResponse);
}

function readFixture(pipeline: string, name: string): string[] {
  return readFileSync(path.join(FIXTURE_DIR, pipeline, name), 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'));
}

/**
 * Reads log lines from tests/fixtures/f5-syslog/<name>, skipping comments and blank lines
 * @param name File name, e.g. ltm.log
 */
export function readF5Fixture(name: string): string[] {
  return readFixture('f5-syslog', name);
}

/**
 * Reads log lines from tests/fixtures/f5-rsyslog/<name>, skipping comments and blank lines
 * @param name File name, e.g. ltm.log
 */
export function readF5RsyslogFixture(name: string): string[] {
  return readFixture('f5-rsyslog', name);
}
