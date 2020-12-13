export interface ILogstashAPIPipeline {
  workers: number,
  batch_size: number,
  batch_delay: number,
  config_reload_automatic: boolean,
  config_reload_interval: number,
  dead_letter_queue_enabled: boolean,
}

export interface Pipelines {[key:string]: ILogstashAPIPipeline }

export interface ILogstashAPIResponse {
  host: string,
  version: string,
  http_address: string,
  id: string,
  name: string,
  pipelines: Pipelines,
}

export interface ILogstashStatus {
  logstashAPI: boolean,
  pipelines: string[],
}
