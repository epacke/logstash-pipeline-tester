import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {Tooltip} from '@mui/material';

export default function ToggleMinify(
  props: {
    handleMinifyChange: (event: React.ChangeEvent<HTMLInputElement>) => void },
) {

  const {handleMinifyChange} = props;

  return (
    <Tooltip
      title={'Minifies JSON in the input area if the JSON is valid.' +
        'Only works for one document at the moment'}
    >
      <FormControlLabel
        control={<Switch defaultChecked={false} onChange={handleMinifyChange}/>}
        label="Minify input JSON"
      />
    </Tooltip>
  );
}
