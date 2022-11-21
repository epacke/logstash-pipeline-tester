import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';

interface ISelectProtocolProps {
  protocol: string,
  setProtocol: (protocol: string) => void,
}

export default function SelectProtocol(props: ISelectProtocolProps) {

  const {protocol, setProtocol} = props;

  const handleChange = (event: SelectChangeEvent) => {
    const {value} = event.target;
    setProtocol(value);
  };

  return (
    <FormControl sx={{maxWidth: '80px', marginRight: '0.5em'}}>
      <Select
        value={protocol || 'TCP'}
        onChange={handleChange}
        displayEmpty
        inputProps={{'aria-label': 'Without label'}}
        data-cy='send-protocol'
      >
        <MenuItem key="TCP" value="TCP">TCP</MenuItem>
        <MenuItem key="UDP" value="UDP">UDP</MenuItem>
      </Select>
    </FormControl>
  );
}
