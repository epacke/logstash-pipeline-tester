var path = require('path'), fs=require('fs');

function fromDir(startPath,filter){

    let foundFiles = [];

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            foundFiles = [...foundFiles, ...fromDir(filename,filter)];
        }
        else if (filename.indexOf(filter)>=0) {
            foundFiles.push(filename);
        };
    };

    return foundFiles;
};

const getConfigFiles = () => {
  let configFiles = (fromDir('/usr/src/pipeline','.conf'));

  let pipeLines = []
  for(configFilePath of configFiles){
    
    let pipeline = {
      name: '',
      protocol: '',
      port: null
    }

    pipeline.name = path.dirname(configFilePath).split(path.sep).pop();

    let configFile = fs.readFileSync(configFilePath, 'utf8');
    const { groups: { tcpPort } } = configFile.match(/input {.+?tcp[^[0-9]+(?<tcpPort>[0-9]+)/ms) || { groups: { tcpPort: null} };
    const { groups: { udpPort } } = configFile.match(/input {.+?udp[^[0-9]+(?<udpPort>[0-9]+)/ms) || { groups: { tcpPort: null} };

    if (tcpPort){
      pipeline.protocol = 'TCP';
      pipeline.port = tcpPort;
      pipeLines.push(pipeline);
    } else if (typeof(udpPort) !== undefined) {
      pipeline.protocol = 'UDP';
      pipeline.port = udpPort;
      pipeLines.push(pipeline);
    }

  }

  return pipeLines;
}

module.exports = getConfigFiles;
