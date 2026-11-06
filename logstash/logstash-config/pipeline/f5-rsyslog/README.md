# f5-rsyslog pipeline

Parses F5 BIG-IP logs relayed through rsyslog into
[ECS](https://www.elastic.co/guide/en/ecs/current/index.html) fields, in detail for `/var/log/ltm`
and `/var/log/audit`. Developed against BIG-IP 17.5.1.11. Expects lines written with this rsyslog
template, which is `RSYSLOG_FileFormat` with the priority added:

```
template(name="F5FileFormat" type="string"
  string="<%PRI%>%TIMESTAMP:::date-rfc3339% %HOSTNAME% %syslogtag%%msg:::sp-if-no-1st-sp%%msg:::drop-last-lf%\n")
```

## Troubleshooting

* `_f5_header_parse_failure` tag: the line doesn't look like BIG-IP syslog written with the template
  above (e.g. no `<PRI>`). Nothing else is parsed.
* `_f5_parse_failure` tag: there is a parser for `event.code` but the message didn't match it. Find
  the block for that code and compare with `message`.
* No `event.action`: there is no parser for that message yet (normal for most messages).
* Every filter has an `id`, so per-filter event counts and timings are visible with
  `curl -s localhost:9600/_node/stats/pipelines/f5-rsyslog?pretty`.

## Known limitations

* mcpd audit lines end at the first newline in the object data (e.g. iRule definitions). Those
  lines have no `f5.audit.status` or `event.outcome`.
* `process.name` for `mprov` is logged as `mprov:2480:`.
