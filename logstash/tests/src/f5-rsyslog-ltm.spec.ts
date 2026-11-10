/*
 Tests for the ltm message parsers in the f5-rsyslog pipeline
 (logstash-config/pipeline/f5-rsyslog/filter.conf, log throttling and ltm sections).
 Lines are from tests/fixtures/f5-rsyslog/ltm.log.
 */

import { sendF5Rsyslog } from './helpers/f5';

describe('F5 rsyslog log throttling', () => {
  it('Reads the number of held messages', async () => {
    const event = await sendF5Rsyslog('<131>2026-11-05T02:08:24+01:00 bigip1 err tmm1[19781]: 01010028:3: Resuming log processing at this invocation; held 9 messages.');

    expect(event).toMatchObject({
      // The message ID is the one of the throttled message
      event: { code: '01010028', action: 'log-throttling-ended' },
      f5_bigip: { log_throttling: { held_messages: 9 } },
    });
    // Not mistaken for the "No members available for pool" message
    expect(event.f5_bigip.pool).toBeUndefined();
    expect(event.tags).toBeUndefined();
  });

  it('Handles the general logging variant', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-04T02:29:16+01:00 bigip1 notice tmm[19781]: 01010028:3: Re-enabling general logging; held 24 messages.');

    expect(event).toMatchObject({
      event: { action: 'log-throttling-ended' },
      f5_bigip: { log_throttling: { held_messages: 24 } },
    });
  });

  it('Recognises when throttling starts', async () => {
    const event = await sendF5Rsyslog('<132>2026-11-04T02:25:13+01:00 localhost.localdomain warning mcpd[5217]: 01071859:4: Per-invocation log rate exceeded; throttling.');

    expect(event.event.action).toEqual('log-throttling-started');
  });
});

describe('F5 rsyslog ltm pools', () => {
  it('Parses monitor status down with the reason', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:59+01:00 localhost.localdomain notice mcpd[5217]: 01070638:5: Pool /Common/lpt_pool member /Common/192.0.2.1:80 monitor status down. [ /Common/lpt_http: down; last error: /Common/lpt_http: No successful responses received before deadline. @2026/11/05 02:08:59.  ]  [ was up for 0hr:0min:27sec ]');

    expect(event).toMatchObject({
      event: {
        code: '01070638',
        action: 'pool-member-status-change',
        reason: 'No successful responses received before deadline.',
      },
      f5_bigip: {
        pool: { name: '/Common/lpt_pool', member: { name: '/Common/192.0.2.1:80', port: 80 } },
        node: { name: '/Common/192.0.2.1', address: '192.0.2.1' },
        status: { type: 'monitor', current: 'down', forced: false, previous: 'up', previous_duration: '0hr:0min:27sec' },
        monitor: { name: '/Common/lpt_http', status: 'down' },
      },
      server: { address: '192.0.2.1', ip: '192.0.2.1', port: 80 },
      related: { ip: ['192.0.2.1'] },
    });
    expect(event.f5_bigip.node.route_domain).toBeUndefined();
    expect(event.error).toBeUndefined();
  });

  it('Parses monitor status forced down', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:24+01:00 localhost.localdomain notice mcpd[5217]: 01070638:5: Pool /Common/lpt_pool member /Common/192.0.2.1:80 monitor status forced down. [ /Common/lpt_icmp: up ]  [ was up for 0hr:0min:47sec ]');

    expect(event.f5_bigip).toMatchObject({
      status: { type: 'monitor', current: 'down', forced: true, previous: 'up' },
      monitor: { name: '/Common/lpt_icmp', status: 'up' },
    });
    expect(event.event.reason).toBeUndefined();
  });

  it('Parses monitor status up', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:07:37+01:00 localhost.localdomain notice mcpd[5217]: 01070727:5: Pool /Common/lpt_pool member /Common/192.0.2.1:80 monitor status up. [ /Common/lpt_icmp: up ]  [ was unchecked for 0hr:0min:1sec ]');

    expect(event).toMatchObject({
      event: { code: '01070727', action: 'pool-member-status-change' },
      f5_bigip: { status: { type: 'monitor', current: 'up', forced: false, previous: 'unchecked', previous_duration: '0hr:0min:1sec' } },
    });
  });

  it('Parses members of a named node', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-04T02:29:16+01:00 localhost.localdomain notice mcpd[5217]: 01070638:5: Pool /Common/always_down-pool member /Common/down-01:7070 monitor status down. [ /Common/http: down; last error: /Common/http: No successful responses received before deadline. @2026/11/04 02:29:16.  ]  [ was unchecked for 0hr:3mins:49sec ]');

    expect(event).toMatchObject({
      event: { reason: 'No successful responses received before deadline.' },
      f5_bigip: {
        pool: { name: '/Common/always_down-pool', member: { name: '/Common/down-01:7070', port: 7070 } },
        node: { name: '/Common/down-01' },
        status: { previous: 'unchecked', previous_duration: '0hr:3mins:49sec' },
      },
    });
    // The address is not in the message
    expect(event.f5_bigip.node.address).toBeUndefined();
    expect(event.server).toBeUndefined();
    expect(event.related).toBeUndefined();
  });

  it('Parses session status', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:09+01:00 localhost.localdomain notice mcpd[5217]: 01070639:5: Pool /Common/lpt_pool member /Common/192.0.2.1:80 session status forced disabled.');

    expect(event).toMatchObject({
      event: { code: '01070639', action: 'pool-member-status-change' },
      f5_bigip: {
        pool: { name: '/Common/lpt_pool', member: { name: '/Common/192.0.2.1:80', port: 80 } },
        node: { name: '/Common/192.0.2.1', address: '192.0.2.1' },
        status: { type: 'session', current: 'disabled', forced: true },
      },
    });
    expect(event.tags).toBeUndefined();
  });

  it('Parses members whose node is down', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-10T01:00:24+01:00 localhost.localdomain notice mcpd[5217]: 01070638:5: Pool /Common/lpt_pool member /Common/lpt_node_down:80 monitor status node down. [ /Common/gateway_icmp: checking ]  [ was unchecked for 0hr:0min:16sec ]');

    expect(event.f5_bigip).toMatchObject({
      pool: { member: { name: '/Common/lpt_node_down:80', port: 80 } },
      node: { name: '/Common/lpt_node_down' },
      status: { type: 'monitor', current: 'node down', forced: false, previous: 'unchecked' },
      monitor: { name: '/Common/gateway_icmp', status: 'checking' },
    });
  });

  it('Parses no members available', async () => {
    const event = await sendF5Rsyslog('<131>2026-11-04T02:29:16+01:00 bigip1 err tmm1[19781]: 01010028:3: No members available for pool /Common/always_down_02-pool');

    expect(event).toMatchObject({
      event: { action: 'pool-no-members-available' },
      f5_bigip: { pool: { name: '/Common/always_down_02-pool' } },
    });
  });

  it('Parses members available again', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:32+01:00 bigip1 notice tmm3[19781]: 01010221:5: Pool /Common/lpt_pool now has available members');

    expect(event).toMatchObject({
      event: { action: 'pool-members-available' },
      f5_bigip: { pool: { name: '/Common/lpt_pool' } },
    });
  });
});

describe('F5 rsyslog ltm nodes', () => {
  it('Parses node monitor status', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-10T01:00:24+01:00 localhost.localdomain notice mcpd[5217]: 01070640:5: Node /Common/lpt_node_down address 192.0.2.250 monitor status down. [ /Common/icmp: down ]  [ was unchecked for 0hr:0min:16sec ]');

    expect(event).toMatchObject({
      event: { code: '01070640', action: 'node-status-change' },
      f5_bigip: {
        node: { name: '/Common/lpt_node_down', address: '192.0.2.250' },
        status: { type: 'monitor', current: 'down', forced: false, previous: 'unchecked', previous_duration: '0hr:0min:16sec' },
        monitor: { name: '/Common/icmp', status: 'down' },
      },
      server: { address: '192.0.2.250', ip: '192.0.2.250' },
      related: { ip: ['192.0.2.250'] },
    });
    expect(event.f5_bigip.pool).toBeUndefined();
    expect(event.server.port).toBeUndefined();
  });

  it('Parses nodes without a monitor', async () => {
    // Two spaces before "address" and an empty monitor result
    const event = await sendF5Rsyslog('<133>2026-11-10T01:00:40+01:00 localhost.localdomain notice mcpd[5217]: 01070640:5: Node /Common/192.0.2.1  address 192.0.2.1 monitor status unchecked. [  ]  [ was forced down for 0hr:0min:3sec ]');

    expect(event).toMatchObject({
      event: { action: 'node-status-change' },
      f5_bigip: {
        node: { name: '/Common/192.0.2.1', address: '192.0.2.1' },
        status: { type: 'monitor', current: 'unchecked', forced: false, previous: 'forced down' },
      },
    });
    expect(event.f5_bigip.monitor).toBeUndefined();
    expect(event.tags).toBeUndefined();
  });

  it('Parses node session status', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-10T01:00:40+01:00 localhost.localdomain notice mcpd[5217]: 01070641:5: Node /Common/192.0.2.1 address 192.0.2.1 session status enabled.');

    expect(event).toMatchObject({
      event: { code: '01070641', action: 'node-status-change' },
      f5_bigip: {
        node: { name: '/Common/192.0.2.1', address: '192.0.2.1' },
        status: { type: 'session', current: 'enabled', forced: false },
      },
    });
  });
  it('Parses the route domain', async () => {
    // The lab lines are in route domain 0, these have a route domain suffix added
    const member = await sendF5Rsyslog('<133>2026-11-10T01:00:40+01:00 localhost.localdomain notice mcpd[5217]: 01070727:5: Pool /Common/lpt_pool member /Common/192.0.2.1%2:80 monitor status up. [ /Common/gateway_icmp: up ]  [ was down for 0hr:0min:3sec ]');
    const node = await sendF5Rsyslog('<133>2026-11-10T01:00:40+01:00 localhost.localdomain notice mcpd[5217]: 01070641:5: Node /Common/lpt_node address 2001:db8::1%2 session status enabled.');

    expect(member).toMatchObject({
      f5_bigip: {
        pool: { member: { name: '/Common/192.0.2.1%2:80', port: 80 } },
        node: { name: '/Common/192.0.2.1%2', address: '192.0.2.1%2', route_domain: 2 },
      },
      server: { address: '192.0.2.1', ip: '192.0.2.1', port: 80 },
      related: { ip: ['192.0.2.1'] },
    });
    expect(node).toMatchObject({
      f5_bigip: { node: { address: '2001:db8::1%2', route_domain: 2 } },
      server: { ip: '2001:db8::1' },
      related: { ip: ['2001:db8::1'] },
    });
  });
});

describe('F5 rsyslog ltm monitors', () => {
  it('Parses monitor instance status', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:24+01:00 localhost.localdomain notice mcpd[5217]: 01070807:5: Monitor /Common/lpt_icmp instance 192.0.2.1:0 has been disabled.');

    expect(event).toMatchObject({
      event: { action: 'monitor-instance-status-change' },
      f5_bigip: {
        monitor: { name: '/Common/lpt_icmp', instance: { address: '192.0.2.1', port: 0 } },
        status: { current: 'disabled' },
      },
    });
  });
});

describe('F5 rsyslog ltm virtual servers and addresses', () => {
  it('Parses virtual server availability', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:24+01:00 localhost.localdomain notice mcpd[5217]: 01071682:5: SNMP_TRAP: Virtual /Common/lpt_vs has become unavailable');

    expect(event).toMatchObject({
      event: { action: 'virtual-server-status-change' },
      f5_bigip: { virtual_server: { name: '/Common/lpt_vs' }, status: { current: 'unavailable' } },
    });
  });

  it('Parses virtual server unchecked', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:43+01:00 localhost.localdomain notice mcpd[5217]: 01071ba9:5: Virtual /Common/lpt_vs has become unchecked');

    expect(event.f5_bigip).toMatchObject({ virtual_server: { name: '/Common/lpt_vs' }, status: { current: 'unchecked' } });
  });

  it('Parses virtual server disabled by user', async () => {
    const event = await sendF5Rsyslog(`<133>2026-11-05T02:09:36+01:00 localhost.localdomain notice mcpd[5217]: 01070921:5: Virtual Server '/Common/lpt_vs' on partition 'Common' disabled by user 'root'.`);

    expect(event).toMatchObject({
      event: { action: 'virtual-server-enabled-change' },
      user: { name: 'root' },
      f5_bigip: { virtual_server: { name: '/Common/lpt_vs' }, partition: 'Common', status: { current: 'disabled' } },
    });
  });

  it('Parses virtual address status', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-05T02:08:24+01:00 localhost.localdomain notice mcpd[5217]: 010719e7:5: Virtual Address /Common/192.0.2.240 general status changed from GREEN to RED.');

    expect(event).toMatchObject({
      event: { action: 'virtual-address-status-change' },
      f5_bigip: {
        virtual_address: { name: '/Common/192.0.2.240' },
        status: { type: 'general', previous: 'GREEN', current: 'RED' },
      },
    });
  });
});

describe('F5 rsyslog ltm iRules', () => {
  it('Parses iRule log statements', async () => {
    const event = await sendF5Rsyslog('<134>2026-11-05T02:09:55+01:00 bigip1 info tmm[19781]: Rule /Common/lpt_irule <HTTP_REQUEST>: lpt request /a?b=c from 192.0.2.163');

    expect(event).toMatchObject({
      event: { action: 'irule-log' },
      f5_bigip: { irule: { name: '/Common/lpt_irule', event: 'HTTP_REQUEST', log_message: 'lpt request /a?b=c from 192.0.2.163' } },
    });
  });

  it('Parses TCL errors', async () => {
    const event = await sendF5Rsyslog('<131>2026-11-05T02:09:55+01:00 bigip1 err tmm3[19781]: 01220001:3: TCL error: /Common/lpt_irule <HTTP_REQUEST> - divide by zero     while executing "expr {1 / 0}"');

    expect(event).toMatchObject({
      event: { action: 'irule-tcl-error' },
      f5_bigip: { irule: { name: '/Common/lpt_irule', event: 'HTTP_REQUEST' } },
      error: { message: 'divide by zero     while executing "expr {1 / 0}"' },
    });
  });
});

describe('F5 rsyslog ltm authentication', () => {
  it('Parses disallowed logins', async () => {
    const event = await sendF5Rsyslog('<131>2026-11-05T02:09:58+01:00 localhost.localdomain err mcpd[5217]: 01070827:3: User login disallowed: User (lptnouser) is not an administrator, does not have a UID of zero, and has not been assigned a role on a partition.');

    expect(event).toMatchObject({
      event: {
        action: 'user-login-disallowed',
        category: ['authentication'],
        outcome: 'failure',
        reason: 'is not an administrator, does not have a UID of zero, and has not been assigned a role on a partition.',
      },
      user: { name: 'lptnouser' },
    });
  });
});

describe('F5 rsyslog ltm messages without a parser', () => {
  it('Keeps only the header fields', async () => {
    const event = await sendF5Rsyslog('<133>2026-11-04T02:27:24+01:00 localhost.localdomain notice mcpd[5217]: 01b5004a:5: Link: 1.1 is UP');

    expect(event.event.code).toEqual('01b5004a');
    expect(event.event.action).toBeUndefined();
    expect(event.f5_bigip).toBeUndefined();
    expect(event.tags).toBeUndefined();
  });
});
