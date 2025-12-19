import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
// @ts-ignore - Problem with the cors typing.
import cors from 'cors';
import pinoHttp from 'pino-http';
import expressWs from 'express-ws';
import logger from './util/Logger';
import apiV1Pipelines from './api/v1/pipelines/index';
import apiV1SendLogLines from './api/v1/sendLogLines/index';
import apiV1ReceiveLogstashOutput from './api/v1/receiveLogstashOutput/index';
import apiV1LogstashStatus from './api/v1/logstashStatus/index';

const dummyApp = express();
const port = 8080;

expressWs(dummyApp);
const {app, getWss} = expressWs(express());

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const httpLogger = pinoHttp({logger});
app.use(httpLogger);

// Render the default page when browsing the root
app.get('/', function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, 'public')} );
});

app.ws('/api/v1/getLogstashOutput', (ws, req) => {});
app.use('/api/v1/pipelines', apiV1Pipelines);
app.use('/api/v1/sendLogLines', apiV1SendLogLines);
app.use('/api/v1/receiveLogstashOutput', apiV1ReceiveLogstashOutput);
app.use('/api/v1/logstashStatus', apiV1LogstashStatus);

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile('index.html', {root: path.join(__dirname, 'public')});
});

app.listen(port,
    () => logger.info(`Logstash config tester running on port ${port}!`));

export {getWss};
