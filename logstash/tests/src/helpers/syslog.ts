/*
 Local log files on a BIG-IP (/var/log/ltm, /var/log/apm etc.) don't contain
 the <PRI> header that is sent over the wire with remote syslog. These helpers
 add it back so that raw log lines can be used as test input.

 PRI = facility * 8 + severity (RFC 5424)
 */

const FACILITIES: Record<string, number> = {
  kern: 0, user: 1, mail: 2, daemon: 3, auth: 4, syslog: 5, lpr: 6, news: 7,
  uucp: 8, cron: 9, authpriv: 10, ftp: 11, ntp: 12, audit: 13, alert: 14, clock: 15,
  local0: 16, local1: 17, local2: 18, local3: 19,
  local4: 20, local5: 21, local6: 22, local7: 23,
};

const SEVERITIES: Record<string, number> = {
  emerg: 0, emergency: 0,
  alert: 1,
  crit: 2, critical: 2,
  err: 3, error: 3,
  warning: 4, warn: 4,
  notice: 5,
  info: 6, informational: 6,
  debug: 7,
};

// Nov  4 02:29:16 bigip1 err tmm2[19781]: ...
const F5_LINE = /^\w{3}\s+\d{1,2} \d{2}:\d{2}:\d{2} \S+ (\w+) /;
const HAS_PRI = /^<\d{1,3}>/;

export function facilityCode(facility: string | number): number {
  const code = typeof facility === 'number' ? facility : FACILITIES[facility.toLowerCase()] ?? Number(facility);
  if (!Number.isInteger(code) || code < 0 || code > 23) {
    throw new Error(`Unknown syslog facility: ${facility}`);
  }
  return code;
}

/**
 * Prepends <PRI> to a raw F5 log line, based on its severity word.
 * Lines that already have a PRI header are returned unchanged.
 * Throws if the severity can't be determined.
 * @param line
 * @param facility Defaults to local0, which is what /var/log/ltm uses
 */
export function addSyslogPri(line: string, facility: string | number = 'local0'): string {
  if (HAS_PRI.test(line)) {
    return line;
  }
  const severityWord = line.match(F5_LINE)?.[1];
  const severity = severityWord === undefined ? undefined : SEVERITIES[severityWord.toLowerCase()];
  if (severity === undefined) {
    throw new Error(`Unable to determine syslog severity for line: ${line}`);
  }
  return `<${facilityCode(facility) * 8 + severity}>${line}`;
}
