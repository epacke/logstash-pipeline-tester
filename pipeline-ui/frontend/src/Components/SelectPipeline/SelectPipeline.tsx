import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import {Backend} from '../../Util/Backend';
import {IPipeline} from '../../Interfaces/CommonInterfaces';
import {useEffect, useState} from 'react';
import Select, {SelectChangeEvent} from '@mui/material/Select';

interface IPipelineProps {
  setPipeline: (pipeline: IPipeline | null) => void,
}

export default function BasicSelect(props: IPipelineProps) {
  const {setPipeline} = props;
  const [pipelines, setPipelines] = useState<IPipeline[]>([]);
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    const {value} = event.target;
    const s = pipelines.find((p) => p.name == value) || null;
    setSelectedValue(value);
    setPipeline(s);
  };

  useEffect(() => {
    preparePipelines().then((p) => {
      setPipelines(p);
    });
  }, []);

  return (
    <FormControl size="small" sx={{minWidth: '250px'}}>
      <Select
        value={selectedValue}
        onChange={handleChange}
        displayEmpty
        inputProps={{'aria-label': 'Without label'}}
        data-cy='pipeline-select'
      >
        <MenuItem value="">
          <em>Select pipeline</em>
        </MenuItem>
        {pipelines.map((p) =>
          <MenuItem
            data-cy={`pipeline-menu-item-${p.name}`}
            key={p.name}
            value={p.name}>
            {p.name}
          </MenuItem>)}
      </Select>
    </FormControl>
  );
}

async function preparePipelines(): Promise<IPipeline[]> {
  const res = await fetch(`${Backend}/api/v1/pipelines`);
  return await res.json() as IPipeline[];
}
