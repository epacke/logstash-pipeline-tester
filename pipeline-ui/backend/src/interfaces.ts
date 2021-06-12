export interface ILogstashAPIPipeline {
  workers: number,
  batchSize: number,
  batchDelay: number,
  configReloadAutomatic: boolean,
  configReloadInterval: number,
  deadLetterQueueEnabled: boolean,
}

export interface Pipelines {[key:string]: ILogstashAPIPipeline }

export interface ILogstashAPIResponse {
  host: string,
  version: string,
  httpAddress: string,
  id: string,
  name: string,
  pipelines: Pipelines,
}

export interface ILogstashStatus {
  logstashAPI: boolean,
  pipelines: string[],
}
