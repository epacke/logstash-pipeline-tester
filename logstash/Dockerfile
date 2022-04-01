FROM logstash:7.13.1

USER root

RUN yum -y --enablerepo=extras install epel-release
RUN yum install -y \
    python-pip \
    supervisor \
    && yum clean all

COPY ./supervisor-config/supervisord.conf /etc/

# Remove the default config files and the pipelines
# as these are mounted from the host instead
RUN rm /usr/share/logstash/config/logstash.yml
RUN rm /usr/share/logstash/config/pipelines.yml
RUN rm -rf /usr/share/logstash/pipeline

ENTRYPOINT "supervisord"
