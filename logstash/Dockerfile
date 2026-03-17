FROM logstash:8.9.2

USER root

# Remove baked-in config as real config is bind-mounted at runtime
RUN rm -f /usr/share/logstash/config/logstash.yml \
    /usr/share/logstash/config/pipelines.yml \
 && rm -rf /usr/share/logstash/pipeline

USER 1000
