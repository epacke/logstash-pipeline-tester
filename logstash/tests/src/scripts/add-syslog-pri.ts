/*
 Adds a <PRI> header to raw F5 log lines so they can be pasted into the
 pipeline tester web interface.

 Usage:
   npm run -s add-pri -- [--facility local0] [file ...]

 Reads from stdin if no files are given, e.g. on macOS:
   pbpaste | npm run -s add-pri | pbcopy

 Lines whose severity can't be determined are passed through unchanged
 with a warning on stderr.
 */

import { readFileSync } from 'fs';
import { addSyslogPri, facilityCode } from '../helpers/syslog';

const args = process.argv.slice(2);
let facility = 'local0';
const files: string[] = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--facility' || args[i] === '-f') {
    facility = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: npm run -s add-pri -- [--facility local0] [file ...]');
    process.exit(0);
  } else {
    files.push(args[i]);
  }
}

try {
  facilityCode(facility);
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
      return addSyslogPri(line, facility);
    } catch (err) {
      console.error(`Warning: ${(err as Error).message}`);
      return line;
    }
  });

console.log(output.join('\n'));
