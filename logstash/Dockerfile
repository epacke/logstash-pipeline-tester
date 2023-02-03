FROM logstash:8.1.1

USER root

RUN apt update
RUN apt install -y \
    python3-pip \
    supervisor

COPY ./supervisor-config/supervisord.conf /etc/

# Remove the default config files and the pipelines
# as these are mounted from the host instead
RUN rm /usr/share/logstash/config/logstash.yml
RUN rm /usr/share/logstash/config/pipelines.yml
RUN rm -rf /usr/share/logstash/pipeline
USER 1000

ENTRYPOINT "supervisord"
