# f5-syslog pipeline

Parses remote syslog from F5 BIG-IP into [ECS](https://www.elastic.co/guide/en/ecs/current/index.html)
fields, in detail for `/var/log/ltm` and `/var/log/audit`. Developed against BIG-IP 17.5.1.11.

## Variants

Organizations ingest BIG-IP logs in different ways, and the format of the line that reaches
Logstash depends on the path it takes. This repository has two examples:

* `f5-syslog` (this one): remote syslog straight from the BIG-IP. Lines start with `<PRI>` and the
  BIG-IP's own timestamp, which has no year or time zone.
* [`f5-rsyslog`](../f5-rsyslog/README.md): relayed through an rsyslog server that writes the lines
  to a file, from where they are shipped by e.g. Filebeat. Lines start with `<PRI>` and an RFC 3339
  timestamp.

Apart from the timestamp, both parse the same way. They have separate configuration, tests and
fixtures, so either can be used or changed without the other.

## Troubleshooting

* `_f5_header_parse_failure` tag: the line doesn't look like BIG-IP syslog. Nothing else is parsed.
* `_f5_parse_failure` tag: there is a parser for `event.code` but the message didn't match it. Find
  the block for that code and compare with `message`.
* No `event.action`: there is no parser for that message yet (normal for most messages).
* Wrong `@timestamp`: the BIG-IP sends local time without a time zone. Set `F5_TIMEZONE`
  (e.g. `Europe/Stockholm`) in the Logstash environment. The year is guessed by Logstash.
* Every filter has an `id`, so per-filter event counts and timings are visible with
  `curl -s localhost:9600/_node/stats/pipelines/f5-syslog?pretty`.

## Known limitations

* mcpd audit lines end at the first newline in the object data (e.g. iRule definitions). Those
  lines have no `f5_bigip.audit.status` or `event.outcome`.
* The TCP input splits on newlines. BIG-IP sends remote syslog over UDP by default.
* `process.name` for `mprov` is logged as `mprov:2480:`.
* `boot_marker` lines in local log files use an ISO timestamp and aren't parsed.
