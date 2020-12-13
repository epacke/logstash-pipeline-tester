import express from 'express';
const router = express.Router();

// Monitor the logstash container
import {ILogstashAPIResponse, ILogstashStatus} from '../../../interfaces';
import request from 'superagent';
import {LOGSTASH} from '../../../util/LogstashAddress';

router.get('/', async function(req, res){

  let responseJson: ILogstashStatus = {
    logstashAPI: false,
    pipelines: [],
  }

  try {
    let logstashResult = await request.get(`http://${LOGSTASH}:9600/_node/pipelines`)
    const logstashResponse = logstashResult.body as ILogstashAPIResponse;
    responseJson.pipelines = Object.keys(logstashResponse.pipelines)
    responseJson.logstashAPI = true;
  } catch(e) {}

  res.json(responseJson);

});

export default router;
