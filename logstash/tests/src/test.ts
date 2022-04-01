
import {ProcessLogLine} from './helpers';

(async () => {

  const d1 = await ProcessLogLine(JSON.stringify({"key": "value"}), '5060', 'TCP')
  const d2 = await ProcessLogLine(`<44>Mar 23 14:21:41 bigip.xip.se warning syslog-ng[2584]: WARNING: Default value changed for the prefix() option of systemd-journal source in syslog-ng 3.8; old_value='', new_value='.journald.'`, '5245', 'TCP');

  console.log(d1);
  console.log(d2);
})()
