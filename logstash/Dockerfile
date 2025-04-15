# Use specific version for reproducibility
FROM logstash:8.16.6

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1

# Install dependencies in a single layer to reduce image size
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3-pip \
    supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy supervisor configuration
COPY ./supervisor-config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Remove default configurations
RUN rm -f \
    /usr/share/logstash/config/logstash.yml \
    /usr/share/logstash/config/pipelines.yml \
    /usr/share/logstash/pipeline/*

# Set proper permissions
RUN chown -R logstash:logstash /usr/share/logstash

# Switch to non-root user
USER logstash

# Set working directory
WORKDIR /usr/share/logstash

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9600/ || exit 1

# Use exec form for ENTRYPOINT
ENTRYPOINT ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
