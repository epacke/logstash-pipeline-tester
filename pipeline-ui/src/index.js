const express = require('express');
const bodyParser = require('body-parser');
const net = require('net');
const dgram = require('dgram');
const request = require('superagent');
const cors = require('cors');
const getPipelines = require('./getpipelines');

const app = express();
const port = 8080;

const logstashInstance = 'logstash';

const expressWs = require('express-ws')(app);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

var aWss = expressWs.getWss('/');

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

    console.log('got a request');
    let responseJson = {
        logstashAPI: false,
        pipelines: []
    }

    try {
        let logstashResult = await request.get('http://logstash:9600/_node/pipelines')
        responseJson.logstashAPI = true;
        if(logstashResult.body && logstashResult.body.pipelines){
            responseJson.pipelines = Object.keys(logstashResult.body.pipelines)
        }
    } catch(e) {}

    console.log('sending response');
    res.json(responseJson);

});

// Receive data from logstash and echo it over websocket to all connected clients
app.post('/log', function(req, res){
    let body = req.body;
    aWss.clients.forEach(function (client) {
        client.send(JSON.stringify(body, null, 4));
    });
    res.status(200).end();
});

// Send data to a logstash pipeline using TCP
function sendTCP(payload, port){
    var conn = net.createConnection({host: logstashInstance, port: port}, function() {
        conn.write(payload);
    })
    .on('error', function(err) {
        console.error(`Failed to send payload to ${port}. Has all logstash pipelines started successfully?`);
    });
}

// Send data to a logstash pipeline using UDP
function sendUDP(payload, port) {

    console.log(`Sending the following payload over UDP:\n${payload}`);

    var message = new Buffer(payload);

    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, port, logstashInstance, function(err, bytes) {
        if (err) throw err;
        client.close();
    });
}


// Websockets endpoint for the webui
app.ws('/getLogs', (ws, req) => {});

app.listen(port, () => console.log(`Logstash config tester running on port ${port}!`))
