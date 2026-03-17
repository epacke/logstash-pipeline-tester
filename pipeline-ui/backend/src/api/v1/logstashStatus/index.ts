import express from 'express';
const router = express.Router();

// Monitor the logstash container
import {ILogstashAPIResponse, ILogstashStatus} from '../../../interfaces';
import request from 'superagent';
import {LOGSTASH} from '../../../constants/LogstashAddress';
import logger from '../../../util/Logger';

router.get('/', async function(req, res) {
  const responseJson: ILogstashStatus = {
    logstashAPI: false,
    pipelines: [],
  };

  try {
    const logstashResult = await request.get(`http://${LOGSTASH}:9600/_node/pipelines`);
    const logstashResponse = logstashResult.body as ILogstashAPIResponse;
    responseJson.pipelines = Object.keys(logstashResponse.pipelines);
    responseJson.logstashAPI = true;
  } catch (e) {
    logger.debug({message: 'Logstash is not available', details: (e as Error).message});
  }

  res.json(responseJson);
});

export default router;
