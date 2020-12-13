import express, {response} from 'express';
import bodyParser from 'body-parser';
import * as net from 'net';
import * as dgram from 'dgram';
import request from 'superagent';
// @ts-ignore - Problem with the cors typing.
import cors from 'cors';
import getPipelines from './getpipelines';
import { ILogstashAPIResponse, ILogstashStatus} from './interfaces';
import { LOGSTASH } from './util/LogstashAddress';

const dummyApp = express();
const port = 8080;

import expressWs from 'express-ws';
expressWs(dummyApp);
const { app, getWss, applyTo } = expressWs(express());

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Render the default page when browsing the root
app.get('/', function(req, res){
    res.sendfile('index.html', { root: __dirname + "/public/index.html" } );
});

// Generates a JSON object representing the pipelines folder
app.get('/pipelines', function(req, res){
    res.json(getPipelines());
});


// Receive lines from the web ui
app.post('/send', function(req, res){
    let { sendString, port, protocol } = req.body;
    sendString = `${sendString}\n`;
    protocol === 'TCP' ? sendTCP(sendString, port) : sendUDP(sendString, port)
    res.status(200).end();
});

// Monitor the logstash container
app.get('/logstashStatus', async function(req, res){

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

// Receive data from logstash and echo it over websocket to all connected clients
app.post('/log', function(req, res){
    let body = req.body;
    getWss().clients.forEach(function (client) {
        client.send(JSON.stringify(body, null, 4));
    });
    res.status(200).end();
});

// Send data to a logstash pipeline using TCP
function sendTCP(payload: string, port: number){
    const conn = net.createConnection({host: LOGSTASH, port: port}, function() {
        conn.write(payload);
    })
    .on('error', function(err) {
        console.error(`Failed to send payload to ${port}. Has all logstash pipelines started successfully?`);
    });
}

// Send data to a logstash pipeline using UDP
function sendUDP(payload: string, port: number) {
    const message = new Buffer(payload);

    const client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, port, LOGSTASH, function(err, bytes) {
        if (err) throw err;
        client.close();
    });
}


// Websockets endpoint for the webui
app.ws('/getLogs', (ws, req) => {});

app.listen(port, () => console.log(`Logstash config tester running on port ${port}!`))
