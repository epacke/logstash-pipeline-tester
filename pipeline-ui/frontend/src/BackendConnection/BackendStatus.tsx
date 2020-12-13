import React, { useState, useEffect } from 'react';
import Backend from '../Util/Backend';

interface IBackendState {
  backendConnected: boolean,
}

const BackendState = (props: IBackendState) => {

  const { backendConnected } = props;

  const backendText = backendConnected ? 'Backend connected' : 'Backend not connected';
  const backendClass = backendConnected ? 'success' : 'danger';

  return (
    <button
      id="logstash-status"
      className={`btn btn-xs btn-${backendClass} m-1 mt-3 py-1`}
    >
      {backendText}
    </button>
  )
}

export default BackendState;
