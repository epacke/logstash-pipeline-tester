import React, {useState, useEffect} from 'react';
import JSONPretty from 'react-json-pretty';
import './pipeline-ui.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {IPipeline} from './Interfaces/CommonInterfaces';
import LogStashStatus from './LogstashStatus/LogStashStatus';
import BackendState from './BackendConnection/BackendStatus';
import ConnectBackend from './Util/ConnectBackend';
import PipelineInputForm from './PipelineInputForm/PipelineInputForm';
import PipelineDropdown from './PipelineDropdown/PipelineDropdown';

function App() {
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [logStashResult, setLogstashResult] = useState<string[]>([]);
  const [pipeline, setPipeline] = useState<IPipeline>(
    {port: '', protocol: '', name: ''});

  const handleLogStashResult = (message: string) => {
    setLogstashResult((prevState) => {
      return [...prevState, message];
    });
  };

  useEffect(() => {
    ConnectBackend(setBackendConnected, handleLogStashResult);
  }, []);


  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col">
          <span className="h3 align-middle">Logstash pipeline tester</span>
          <PipelineDropdown setPipeline={setPipeline}/>
          <div className="float-right">
            <BackendState backendConnected={backendConnected}/>
            <LogStashStatus/>
          </div>
          <table id="send-table" className="table table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Raw Log lines</th>
                <th>Port</th>
                <th>Protocol</th>
                <th>&nbsp</th>
              </tr>
            </thead>
            <tbody>
              <PipelineInputForm setLogstashResult={setLogstashResult}
                pipeline={pipeline} setPipeline={setPipeline}/>
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label htmlFor="logstash-result"
              className="label-info col-form-label-lg">
              Logstash pipeline output
            </label>
            <div className="h-100 overflow-auto" id="logstash-result">
              {logStashResult.length ? logStashResult.map((res) => {
                return <JSONPretty key={btoa(res)}
                  id="json-pretty" data={res}/>;
              }) :
                <JSONPretty key={'null'} id="json-pretty" data={'No data yet'}/>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
