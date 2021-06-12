import React, {useState, useRef} from 'react';
import {IPipeline} from '../Interfaces/CommonInterfaces';
import BACKEND from '../Util/Backend';

interface IPipelineInputForm {
  pipeline: IPipeline,
  setLogstashResult: (result: string[]) => void,
  setPipeline: (pipeline: IPipeline) => void,
}

const PipelineInputForm = (props: IPipelineInputForm) => {
  const {setLogstashResult, pipeline, setPipeline} = props;
  const [logLines, setLogLines] = useState<string>('');
  const logLinesTextArea = useRef<HTMLTextAreaElement>(null);

  const handleLogLinesChange = () => {
    setLogLines(logLinesTextArea.current?.value || '');
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPipeline({...pipeline, port: e.target.value});
  };

  const handleProtocolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPipeline({...pipeline, protocol: e.target.value});
  };

  const handleSubmit = async () => {
    setLogstashResult([]);
    const {port, protocol} = pipeline;
    submitLogLines(logLines, port, protocol);
  };

  return (
    <tr>
      <td><textarea ref={logLinesTextArea}
        onChange={handleLogLinesChange} id="send-string"/></td>
      <td><input id="send-port" defaultValue={pipeline.port}
        onChange={handlePortChange}/></td>
      <td>
        <select id="send-protocol" value={pipeline.protocol}
          onChange={handleProtocolChange}>
          <option value="UDP">UDP</option>
          <option value="TCP">TCP</option>
        </select>
      </td>
      <td>
        <button id="send-button" onClick={handleSubmit}>Send</button>
      </td>
    </tr>
  );
};

function submitLogLines(logLines: string, port: string, protocol: string) {
  fetch(
      `${BACKEND}/api/v1/sendLogLines`, {
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
        },
        'body': JSON.stringify(
            {sendString: logLines, port: port, protocol: protocol},
        ),
      },
  );
}

export default PipelineInputForm;
