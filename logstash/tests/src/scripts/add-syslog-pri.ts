/*
 Adds a <PRI> header to raw F5 log lines so they can be pasted into the
 pipeline tester web interface.

 Usage:
   npm run -s add-pri -- [--facility local0] [file ...]
   npm run -s add-pri -- --rsyslog [--year 2026] [--tz Europe/Stockholm | --offset +01:00] [file ...]

 --rsyslog also replaces the BIG-IP timestamp with an RFC 3339 one, as
 written by rsyslog for the f5-rsyslog pipeline. The BIG-IP timestamp has
 no year or time zone: the year defaults to the current one and the offset
 to this machine's time zone on that date.

 Reads from stdin if no files are given, e.g. on macOS:
   pbpaste | npm run -s add-pri | pbcopy

 Lines that can't be converted are passed through unchanged with a warning
 on stderr.
 */

import { readFileSync } from 'fs';
import { addSyslogPri, facilityCode, RsyslogOptions, toRsyslogFormat } from '../helpers/syslog';

const USAGE = 'Usage: npm run -s add-pri -- [--facility local0] [--rsyslog [--year 2026] [--tz Europe/Stockholm | --offset +01:00]] [file ...]';

const args = process.argv.slice(2);
let facility = 'local0';
let rsyslog = false;
const rsyslogOptions: RsyslogOptions = {};
const files: string[] = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--facility' || args[i] === '-f') {
    facility = args[++i];
  } else if (args[i] === '--rsyslog') {
    rsyslog = true;
  } else if (args[i] === '--year') {
    rsyslogOptions.year = Number(args[++i]);
  } else if (args[i] === '--tz') {
    rsyslogOptions.timeZone = args[++i];
  } else if (args[i] === '--offset') {
    rsyslogOptions.offset = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(USAGE);
    process.exit(0);
  } else {
    files.push(args[i]);
  }
}

try {
  facilityCode(facility);
  if (rsyslogOptions.year !== undefined && !Number.isInteger(rsyslogOptions.year)) {
    throw new Error('--year must be a number, e.g. 2026');
  }
  if (rsyslogOptions.timeZone !== undefined) {
    // Throws RangeError on unknown time zones
    new Intl.DateTimeFormat('en-US', { timeZone: rsyslogOptions.timeZone });
  }
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

const input = files.length ?
  files.map((file) => readFileSync(file, 'utf8')).join('\n') :
  readFileSync(0, 'utf8');

const output = input
  .split(/\r\n|\r|\n/)
  .filter((line) => line.trim() !== '')
  .map((line) => {
    try {
      return rsyslog ?
        toRsyslogFormat(line, { ...rsyslogOptions, facility }) :
        addSyslogPri(line, facility);
    } catch (err) {
      console.error(`Warning: ${(err as Error).message}`);
      return line;
    }
  });

console.log(output.join('\n'));
