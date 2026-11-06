/*
 Tests for the audit message parsers in the f5-syslog pipeline
 (logstash-config/pipeline/f5-syslog/filter.conf, audit section).
 Lines are from tests/fixtures/f5-syslog/audit.log.
 */

import { sendF5 } from './helpers/f5';

describe('F5 audit configuration changes', () => {
  it('Parses a tmsh create', async () => {
    const event = await sendF5('Nov  5 02:07:42 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client tmsh, tmsh-pid-15445, user root - transaction #365983-2 - object 0 - create { virtual_server { virtual_server_name "/Common/lpt_vs" virtual_server_va_name "192.0.2.240" virtual_server_port 80 virtual_server_ip_proto 6 virtual_server_default_pool "lpt_pool" virtual_server_source_address_translation_type 3 } } [Status=Command OK]');

    expect(event).toMatchObject({
      event: { dataset: 'f5.audit', action: 'configuration-change', category: 'configuration', type: 'creation', outcome: 'success' },
      user: { name: 'root' },
      f5: {
        audit: {
          client: 'tmsh',
          client_pid: 15445,
          transaction: '365983-2',
          operation: 'create',
          object_type: 'virtual_server',
          object_name: '/Common/lpt_vs',
          object: '{ virtual_server { virtual_server_name "/Common/lpt_vs" virtual_server_va_name "192.0.2.240" virtual_server_port 80 virtual_server_ip_proto 6 virtual_server_default_pool "lpt_pool" virtual_server_source_address_translation_type 3 } }',
          status: 'Command OK',
        },
      },
    });
  });

  it('Parses a GUI (tmui) modify', async () => {
    const event = await sendF5('Nov  4 02:19:20 localhost.localdomain notice mcpd[7025]: 01070417:5: AUDIT - client tmui, user admin - transaction #1914467-2 - object 0 - modify { software_desired { software_desired_volume "HD1.2" software_desired_active 1 } } [Status=Command OK]');

    expect(event).toMatchObject({
      event: { type: 'change', outcome: 'success' },
      user: { name: 'admin' },
      f5: { audit: { client: 'tmui', operation: 'modify', object_type: 'software_desired', object_name: 'HD1.2' } },
    });
    expect(event.f5.audit.client_pid).toBeUndefined();
  });

  it('Parses a delete', async () => {
    const event = await sendF5('Nov  5 02:10:03 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client tmsh, tmsh-pid-15937, user root - transaction #366677-2 - object 0 - obj_delete { pool { pool_name "/Common/lpt_pool" } } [Status=Command OK]');

    expect(event).toMatchObject({
      event: { type: 'deletion' },
      f5: { audit: { operation: 'obj_delete', object_type: 'pool', object_name: '/Common/lpt_pool' } },
    });
  });

  it('Parses system changes by an unknown client', async () => {
    const event = await sendF5('Nov  4 02:25:13 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client Unknown, user Unknown - transaction #11-1 - object 0 - create_if { db_variable { db_variable_name "version.edition" db_variable_value "<none>" db_variable_sync_type "private_internal" db_variable_data_type "string" db_variable_display_name "Version.Edition" } } [Status=Command OK]');

    expect(event).toMatchObject({
      event: { type: 'creation' },
      user: { name: 'Unknown' },
      f5: { audit: { client: 'Unknown', operation: 'create_if', object_type: 'db_variable', object_name: 'version.edition' } },
    });
  });

  // The object name is the value of the first field, the object's key in mcpd.
  // For objects that belong to another object, that's the parent's name.
  it.each([
    ['pool_member', '/Common/lpt_pool', 'Nov  5 02:07:36 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client tmsh, tmsh-pid-15359, user root - transaction #365913-3 - object 0 - create { pool_member { pool_member_pool_name "/Common/lpt_pool" pool_member_node_name "/Common/192.0.2.1" pool_member_port 80 } } [Status=Command OK]'],
    ['virtual_server_profile', '/Common/lpt_vs', 'Nov  5 02:07:42 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client tmsh, tmsh-pid-15445, user root - transaction #365983-3 - object 0 - create { virtual_server_profile { virtual_server_profile_vs_name "/Common/lpt_vs" virtual_server_profile_profile_name "/Common/tcp" } } [Status=Command OK]'],
    ['ips_inspection_sig', '/Common/microsoft_iis_http_protocol_stack_remote_code_execution', 'Nov  4 02:28:14 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client tmsh, tmsh-pid-22125, user root - transaction #4666-2 - object 0 - create { ips_inspection_sig { ips_inspection_sig_insp_tag "/Common/microsoft_iis_http_protocol_stack_remote_code_execution" ips_inspection_sig_direction 1 ips_inspection_sig_documentation "" ips_inspection_sig_id 2836 ips_inspection_sig_protocol 1 ips_inspection_sig_subscription 1 ips_inspection_sig_config_source 0 } } [Status=Command OK]'],
  ])('Reads the object name of a %s', async (objectType, objectName, line) => {
    const event = await sendF5(line);

    expect(event.f5.audit).toMatchObject({ object_type: objectType, object_name: objectName });
  });

  it('Has no object name for objects keyed on a number', async () => {
    const event = await sendF5('Nov  4 02:28:59 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client Unknown, user tmrouted - transaction #11063-1 - object 0 - modify_if { rp_current_status { rp_current_status_slot_id 0 rp_current_status_state 3 } } [Status=Command OK]');

    expect(event).toMatchObject({
      event: { action: 'configuration-change', type: 'change' },
      user: { name: 'tmrouted' },
      f5: { audit: { operation: 'modify_if', object_type: 'rp_current_status' } },
    });
    expect(event.f5.audit.object_name).toBeUndefined();
  });

  it('Parses lines that were cut at a newline in the iRule definition', async () => {
    const event = await sendF5('Nov  5 02:07:41 localhost.localdomain notice mcpd[5217]: 01070417:5: AUDIT - client tmsh, tmsh-pid-15430, user root - transaction #365965-2 - object 0 - create { rule { rule_name "/Common/lpt_irule" rule_definition "when HTTP_REQUEST {');

    expect(event).toMatchObject({
      event: { action: 'configuration-change', type: 'creation' },
      f5: { audit: { object_type: 'rule', object_name: '/Common/lpt_irule', object: '{ rule { rule_name "/Common/lpt_irule" rule_definition "when HTTP_REQUEST {' } },
    });
    // No [Status=...] means no outcome
    expect(event.f5.audit.status).toBeUndefined();
    expect(event.event.outcome).toBeUndefined();
  });
});

describe('F5 audit tmsh commands', () => {
  it('Parses a successful command', async () => {
    const event = await sendF5('Nov  5 02:09:36 localhost.localdomain notice tmsh[15714]: 01420002:5: AUDIT - pid=15714 user=root folder=/Common module=(tmos)# status=[Command OK] cmd_data=modify ltm virtual lpt_vs disabled');

    expect(event).toMatchObject({
      event: { action: 'tmsh-command', outcome: 'success' },
      process: { name: 'tmsh', pid: 15714 },
      user: { name: 'root' },
      f5: { audit: { folder: '/Common', module: 'tmos', status: 'Command OK', command: 'modify ltm virtual lpt_vs disabled' } },
    });
  });

  it('Parses a failed command', async () => {
    const event = await sendF5('Nov  3 23:37:01 localhost.localdomain notice tmsh[16854]: 01420002:5: AUDIT - pid=16854 user=root folder=/Common module=(tmos)# status=[Syntax Error: a volume must be specified] cmd_data=install /sys software image BIGIP-17.5.1.11-0.0.12.iso create-volume');

    expect(event).toMatchObject({
      event: { action: 'tmsh-command', outcome: 'failure' },
      f5: { audit: { status: 'Syntax Error: a volume must be specified', command: 'install /sys software image BIGIP-17.5.1.11-0.0.12.iso create-volume' } },
    });
  });
});

describe('F5 audit logins', () => {
  it('Parses an ssh session start', async () => {
    const event = await sendF5('Nov  3 07:34:30 localhost.localdomain info sshd(pam_audit)[10545]: 01070417:6: AUDIT - user root - RAW: sshd(pam_audit): user=root(root) partition=[All] level=Administrator tty=ssh host=192.0.2.163 attempts=1 start="Tue Nov  3 07:34:30 2026".');

    expect(event).toMatchObject({
      event: { action: 'session-start', category: 'authentication', type: 'start', outcome: 'success' },
      user: { name: 'root', roles: 'Administrator' },
      source: { address: '192.0.2.163', ip: '192.0.2.163' },
      f5: { audit: { service: 'sshd', partition: 'All', tty: 'ssh', login_attempts: 1, session: { start: '2026-11-03T07:34:30.000Z' } } },
    });
    expect(event.f5.audit.session.end).toBeUndefined();
  });

  it('Parses an ssh session end', async () => {
    const event = await sendF5('Nov  3 07:44:51 localhost.localdomain info sshd(pam_audit)[10545]: 01070417:6: AUDIT - user root - RAW: sshd(pam_audit): user=root(root) partition=[All] level=Administrator tty=ssh host=192.0.2.163 attempts=1 start="Tue Nov  3 07:34:30 2026" end="Tue Nov  3 07:44:51 2026".');

    expect(event).toMatchObject({
      event: { action: 'session-end', type: 'end', outcome: 'success' },
      f5: { audit: { session: { start: '2026-11-03T07:34:30.000Z', end: '2026-11-03T07:44:51.000Z' } } },
    });
  });

  it('Parses sessions without attempts', async () => {
    const event = await sendF5('Nov  4 04:00:50 localhost.localdomain info sshd(pam_audit)[24497]: 01070417:6: AUDIT - user root - RAW: sshd(pam_audit): user=root(root) partition=[All] level=Administrator tty=ssh host=192.0.2.163 start="Wed Nov  4 02:30:28 2026" end="Wed Nov  4 04:00:50 2026".');

    expect(event.event.action).toEqual('session-end');
    expect(event.f5.audit.login_attempts).toBeUndefined();
  });

  it('Parses an iControl REST login', async () => {
    const event = await sendF5('Nov  3 03:30:06 localhost.localdomain info rest(pam_audit)[602]: 01070417:6: AUDIT - user bigipreport - RAW: rest(pam_audit): user=bigipreport(bigipreport) partition=[All] level=Auditor tty=(unknown) host=198.51.100.11 attempts=1 start="Tue Nov  3 03:30:06 2026" end="Tue Nov  3 03:30:06 2026".');

    expect(event).toMatchObject({
      user: { name: 'bigipreport', roles: 'Auditor' },
      source: { ip: '198.51.100.11' },
      f5: { audit: { service: 'rest', tty: '(unknown)' } },
    });
  });

  it('Parses a GUI login from httpd(mod_auth_pam)', async () => {
    const event = await sendF5('Nov  3 07:36:56 localhost.localdomain notice httpd[28005]: 01070417:5: AUDIT - user admin - RAW: httpd(mod_auth_pam): user=admin(admin) partition=[All] level=Administrator tty=/bin/false host=192.0.2.163 attempts=1 start="Tue Nov  3 07:36:56 2026".');

    expect(event).toMatchObject({
      event: { action: 'session-start' },
      user: { name: 'admin' },
      f5: { audit: { service: 'httpd', tty: '/bin/false' } },
    });
  });

  it('Parses a failed login', async () => {
    const event = await sendF5('Nov  3 07:36:46 localhost.localdomain info httpd(pam_audit)[28009]: 01070417:6: AUDIT - user admin - RAW: httpd(pam_audit): User=admin tty=(unknown) host=192.0.2.163 failed to login after 1 attempts (start="Tue Nov  3 07:36:44 2026" end="Tue Nov  3 07:36:46 2026").');

    expect(event).toMatchObject({
      event: { action: 'login-failed', category: 'authentication', type: 'start', outcome: 'failure' },
      user: { name: 'admin' },
      source: { ip: '192.0.2.163' },
      f5: { audit: { service: 'httpd', login_attempts: 1, session: { start: '2026-11-03T07:36:44.000Z', end: '2026-11-03T07:36:46.000Z' } } },
    });
  });
});

describe('F5 audit messages without a parser', () => {
  it('Keeps only the header fields', async () => {
    const event = await sendF5('Nov  4 02:25:40 localhost.localdomain notice devmgmtd[5562]: 015a0000:5: AUDIT : Update CA bundle requested');

    expect(event.event).toMatchObject({ code: '015a0000', dataset: 'f5.audit' });
    expect(event.event.action).toBeUndefined();
    expect(event.tags).toBeUndefined();
  });
});
