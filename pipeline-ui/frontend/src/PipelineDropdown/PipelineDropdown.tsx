import React, {useEffect, useRef, useState} from 'react';
import Backend from '../Util/Backend';
import {IPipeline} from '../Interfaces/CommonInterfaces';

interface IPipelineProps {
  setPipeline: (pipeline: IPipeline) => void,
}

const PipelineDropdown = (props: IPipelineProps) => {
  const {setPipeline} = props;
  const [pipelines, setPipelines] = useState<IPipeline[]>([]);

  const pipelineSelect = useRef<HTMLSelectElement>(null);

  // Load the existing pipelines
  useEffect(() => {
    preparePipelines().then((p) => {
      setPipelines(p);
    });
  }, []);

  const handleChange = () => {
    const index = pipelineSelect.current?.selectedIndex || 0;
    const name = pipelineSelect.current?.options[index].value || '';
    const port = pipelineSelect.current?.options[index]
      .getAttribute('data-port') || '';
    const protocol = pipelineSelect.current?.options[index]
      .getAttribute('data-protocol') || '';
    setPipeline({name, protocol, port});
  };

  const optionList = pipelines.map((p) => {
    const {name, protocol, port} = p;
    return <option key={name} data-protocol={protocol}
      data-port={port} value={name}>{name}</option>;
  });

  return (
    <select id="pipeline-select" ref={pipelineSelect}
      className="custom-select m-1 mt-3" onChange={handleChange}>
      <option key="select-pipeline" value="">Select pipeline</option>
      {optionList}
    </select>
  );
};


async function preparePipelines() {
  const res = await fetch(`${Backend}/api/v1/pipelines`);
  const pipelines: IPipeline[] = await res.json();

  return pipelines;

  /*
  $('select#pipeline-select').on('change', function(select) {
    const selectedOption = $('select#pipeline-select option:selected');
    $('input#send-port').val(selectedOption.attr('data-port'));
    $('select#send-protocol').val(selectedOption.attr('data-protocol'))
  });

   */
}

export default PipelineDropdown;
