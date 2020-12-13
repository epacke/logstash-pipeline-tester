"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Return file names from directory
function fromDir(startPath, filter) {
    let foundFiles = [];
    if (!fs_1.default.existsSync(startPath)) {
        console.log('Directory did not exist', startPath);
        return [];
    }
    let files = fs_1.default.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        let filename = path_1.default.join(startPath, files[i]);
        let stat = fs_1.default.lstatSync(filename);
        if (stat.isDirectory()) {
            foundFiles = [...foundFiles, ...fromDir(filename, filter)];
        }
        else if (filename.indexOf(filter) >= 0) {
            foundFiles.push(filename);
        }
        ;
    }
    ;
    return foundFiles;
}
;
// Get pipeline configs from the pipeline directory
const getConfigFiles = () => {
    var _a, _b;
    let configFiles = (fromDir('/usr/src/pipeline', '.conf'));
    let pipeLines = [];
    for (let configFilePath of configFiles) {
        let pipeline = {};
        pipeline.name = path_1.default.dirname(configFilePath).split(path_1.default.sep).pop() || 'unknown';
        let configFile = fs_1.default.readFileSync(configFilePath, 'utf8');
        const tcpMatch = configFile.match(/input {.+?tcp[^[0-9]+(?<tcpPort>[0-9]+)/ms) || { groups: { tcpPort: undefined } };
        const tcpPort = (_a = tcpMatch.groups) === null || _a === void 0 ? void 0 : _a.tcpPort;
        const udpMatch = configFile.match(/input {.+?udp[^[0-9]+(?<udpPort>[0-9]+)/ms) || { groups: { udpPort: undefined } };
        const udpPort = (_b = udpMatch.groups) === null || _b === void 0 ? void 0 : _b.udpPort;
        if (tcpPort) {
            pipeline.protocol = 'TCP';
            pipeline.port = tcpPort;
            pipeLines.push(pipeline);
        }
        else if (typeof (udpPort) !== undefined) {
            pipeline.protocol = 'UDP';
            pipeline.port = udpPort;
            pipeLines.push(pipeline);
        }
    }
    return pipeLines;
};
exports.default = getConfigFiles;
