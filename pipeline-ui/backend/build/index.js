"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const net = __importStar(require("net"));
const dgram = __importStar(require("dgram"));
const superagent_1 = __importDefault(require("superagent"));
// @ts-ignore - Problem with the cors typing.
const cors_1 = __importDefault(require("cors"));
const getpipelines_1 = __importDefault(require("./getpipelines"));
const LogstashAddress_1 = require("./util/LogstashAddress");
const dummyApp = express_1.default();
const port = 8080;
const express_ws_1 = __importDefault(require("express-ws"));
express_ws_1.default(dummyApp);
const { app, getWss, applyTo } = express_ws_1.default(express_1.default());
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use(express_1.default.static('public'));
// Render the default page when browsing the root
app.get('/', function (req, res) {
    res.sendfile('index.html', { root: __dirname + "/public/index.html" });
});
// Generates a JSON object representing the pipelines folder
app.get('/pipelines', function (req, res) {
    res.json(getpipelines_1.default());
});
// Receive lines from the web ui
app.post('/send', function (req, res) {
    let { sendString, port, protocol } = req.body;
    sendString = `${sendString}\n`;
    protocol === 'TCP' ? sendTCP(sendString, port) : sendUDP(sendString, port);
    res.status(200).end();
});
// Monitor the logstash container
app.get('/logstashStatus', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let responseJson = {
            logstashAPI: false,
            pipelines: [],
        };
        try {
            let logstashResult = yield superagent_1.default.get(`http://${LogstashAddress_1.LOGSTASH}:9600/_node/pipelines`);
            const logstashResponse = logstashResult.body;
            responseJson.pipelines = Object.keys(logstashResponse.pipelines);
            responseJson.logstashAPI = true;
        }
        catch (e) {
            console.log(e);
        }
        res.json(responseJson);
    });
});
// Receive data from logstash and echo it over websocket to all connected clients
app.post('/log', function (req, res) {
    let body = req.body;
    getWss().clients.forEach(function (client) {
        client.send(JSON.stringify(body, null, 4));
    });
    res.status(200).end();
});
// Send data to a logstash pipeline using TCP
function sendTCP(payload, port) {
    console.log(`Sending ${payload} to ${LogstashAddress_1.LOGSTASH}${port}`);
    const conn = net.createConnection({ host: LogstashAddress_1.LOGSTASH, port: port }, function () {
        conn.write(payload);
    })
        .on('error', function (err) {
        console.error(`Failed to send payload to ${port}. Has all logstash pipelines started successfully?`);
    });
}
// Send data to a logstash pipeline using UDP
function sendUDP(payload, port) {
    console.log(`Sending the following payload over UDP:\n${payload}`);
    const message = new Buffer(payload);
    const client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, port, LogstashAddress_1.LOGSTASH, function (err, bytes) {
        if (err)
            throw err;
        client.close();
    });
}
// Websockets endpoint for the webui
app.ws('/getLogs', (ws, req) => { });
app.listen(port, () => console.log(`Logstash config tester running on port ${port}!`));
