import path from 'path';
import fs from 'fs';
import BACKEND_ENDPOINT from '../../../constants/BackendEndpoint';

export interface IPipeline {
  name: string,
  protocol?: string,
  port?: string
}

// Return file names from directory
function fromDir(startPath: string, filter: string): string[] {
  let foundFiles: string[] = [];

  if (!fs.existsSync(startPath)) {
    console.log('Directory did not exist', startPath);
    return [];
  }

  const files=fs.readdirSync(startPath);
  for (let i=0; i<files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      foundFiles = [...foundFiles, ...fromDir(filename, filter)];
    } else if (filename.indexOf(filter)>=0) {
      foundFiles.push(filename);
    }
  }

  return foundFiles;
}


// Get pipeline configs from the pipeline directory
const getConfigFiles = () => {
  const configFiles = fromDir(BACKEND_ENDPOINT, '.conf');

  const pipeLines: IPipeline[] = [];
  for (const configFilePath of configFiles) {
    const name = path.dirname(configFilePath)
        .split(path.sep).pop() || 'unknown';

    const configFile = fs.readFileSync(configFilePath, 'utf8');

    const tcpMatch = configFile
        .match(/input {.+?tcp[^[0-9]+(?<tcpPort>[0-9]+)/ms) ||
        {groups: {tcpPort: undefined}};
    const tcpPort = tcpMatch.groups?.tcpPort;

    const udpMatch = configFile
        .match(/input {.+?udp[^[0-9]+(?<udpPort>[0-9]+)/ms) ||
        {groups: {udpPort: undefined}};
    const udpPort = udpMatch.groups?.udpPort;

    if (tcpPort) {
      pipeLines.push({name, protocol: 'TCP', port: tcpPort});
    } else if (udpPort) {
      pipeLines.push({name, protocol: 'UDP', port: udpPort});
    }
  }

  return pipeLines;
};

export default getConfigFiles;
