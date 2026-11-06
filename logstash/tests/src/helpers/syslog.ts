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

export interface RsyslogOptions {
  /** Defaults to local0 */
  facility?: string | number;
  /** The BIG-IP timestamp has no year. Defaults to the current year. */
  year?: number;
  /** Fixed offset like +01:00. Takes precedence over timeZone. */
  offset?: string;
  /** IANA time zone the BIG-IP logs in. Defaults to this machine's. */
  timeZone?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// <133>Nov  5 02:08:32 ...
const PRI_AND_F5_TIMESTAMP = /^(<\d{1,3}>)(\w{3}) +(\d{1,2}) (\d{2}):(\d{2}):(\d{2}) /;
const OFFSET = /^[+-]\d{2}:\d{2}$/;

// Offset of timeZone at the given instant, e.g. +01:00
function offsetAt(instant: number, timeZone: string): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(instant))
    .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  // "GMT+01:00", or just "GMT" for UTC
  return name === 'GMT' ? '+00:00' : name.slice(3);
}

function offsetMinutes(offset: string): number {
  const sign = offset.startsWith('-') ? -1 : 1;
  const [hours, minutes] = offset.slice(1).split(':').map(Number);
  return sign * (hours * 60 + minutes);
}

/**
 * Converts a raw F5 log line to the format rsyslog writes with the template
 * in pipeline/f5-rsyslog/README.md: <PRI> followed by an RFC 3339 timestamp.
 * Adds the <PRI> like addSyslogPri if it's missing.
 * Throws if the line has no BIG-IP timestamp or the severity can't be determined.
 * @param line
 * @param options
 */
export function toRsyslogFormat(line: string, options: RsyslogOptions = {}): string {
  const { facility = 'local0', year = new Date().getFullYear(), offset, timeZone } = options;
  if (offset !== undefined && !OFFSET.test(offset)) {
    throw new Error(`Invalid offset, expected e.g. +01:00: ${offset}`);
  }
  const zone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const withPri = addSyslogPri(line, facility);
  const match = withPri.match(PRI_AND_F5_TIMESTAMP);
  const month = match ? MONTHS.indexOf(match[2]) : -1;
  if (!match || month < 0) {
    throw new Error(`No BIG-IP timestamp in line: ${line}`);
  }
  const [prefix, pri, , day, hh, mm, ss] = match;

  let lineOffset = offset;
  if (lineOffset === undefined) {
    // The timestamp is wall clock time in zone. Look up the offset at that
    // time, then again at the corrected instant in case it crosses a DST change.
    const wallClock = Date.UTC(year, month, Number(day), Number(hh), Number(mm), Number(ss));
    const guess = offsetAt(wallClock, zone);
    lineOffset = offsetAt(wallClock - offsetMinutes(guess) * 60000, zone);
  }

  const date = `${year}-${String(month + 1).padStart(2, '0')}-${day.padStart(2, '0')}`;
  return `${pri}${date}T${hh}:${mm}:${ss}${lineOffset} ${withPri.slice(prefix.length)}`;
}
