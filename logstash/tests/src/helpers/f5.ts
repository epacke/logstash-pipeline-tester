import { readFileSync } from 'fs';
import path from 'path';
import { ProcessLogLine } from '.';
import { addSyslogPri } from './syslog';

const F5_PORT = '5245';
const F5_SYSLOG_PORT = '5246';
const FIXTURE_DIR = path.join(__dirname, '..', '..', 'fixtures', 'f5');

/**
 * Sends a raw BIG-IP log line (as found in /var/log/*) to the f5-syslog
 * pipeline and returns the resulting event.
 * The <PRI> header that remote syslog adds is put back first.
 * @param line Raw log line
 * @param facility Defaults to local0, which is used by both ltm and audit
 * @param input `tcp` passes the line through untouched, `syslog` goes through
 * Logstash's syslog input like most deployments
 */
export async function sendF5(line: string, facility: string = 'local0', input: 'tcp' | 'syslog' = 'tcp') {
  const port = input === 'syslog' ? F5_SYSLOG_PORT : F5_PORT;
  const rawResponse = await ProcessLogLine(addSyslogPri(line, facility), port, 'TCP');
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
