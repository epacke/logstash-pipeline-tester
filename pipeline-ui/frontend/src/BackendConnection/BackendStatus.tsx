import React from 'react';

interface IBackendState {
  backendConnected: boolean,
}

const BackendState = (props: IBackendState) => {
  const {backendConnected} = props;

  const backendText = backendConnected ?
      'Backend connected' : 'Backend not connected';
  const backendClass = backendConnected ? 'success' : 'danger';

  return (
    <button
      id="backend-status"
      className={`btn btn-xs btn-${backendClass} m-1 mt-3 py-1`}
    >
      {backendText}
    </button>
  );
};

export default BackendState;
