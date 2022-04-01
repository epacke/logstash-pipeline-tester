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
              {logStashResult.map((res) => {
                return <JSONPretty key={btoa(res)}
                  id="json-pretty" data={res}/>;
              })}
            </div>
          </div>
        </div>
        <div className="col">
          <label htmlFor="help-div"
            className="label-info col-form-label-lg">Help and tips
          </label>
          <div id="help-div">
            <ol>
              <li>Wait until the pipelines has started
                 and the logstash state turns green.
              </li>
              <li>Enter one or more raw log lines in
                the log line input field.
              </li>
              <li>Pick a predefined pipeline or enter
                port and protocol manually.
              </li>
              <li>Click send.</li>
              <li>Check out the result in the
                logstash text area to the right.
              </li>
              <li>Update the pipeline file if
                you&apos;re not happy with the outcome,
                logstash will automatically
                re-read the config when you save
              </li>
              <li>Rince, repeat</li>
            </ol>

            <p className="h2">
              Here&apos;s a few tips in case stuff does not work
            </p>
            <ul>
              <li>Pipelines in the Development environment needs to
                use the http output, look at other pipelines and
                copy if unsure.
              </li>
              <li>Pipelines can be configured to drop stuff.
                Then you won&apos;t get any result.
              </li>
              <li>Grok failures means that the line you send was
                not parseable by a grok expression in the pipeline.
              </li>
              <li>To troubleshoot Grok I can highly recommend the
                <a href="https://grokdebug.herokuapp.com/">Heroku Grok
                Debugger</a>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
