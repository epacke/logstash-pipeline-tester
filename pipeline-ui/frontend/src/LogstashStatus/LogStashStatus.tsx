import React, { useState, useEffect } from 'react';
import Backend from '../Util/Backend';

const LogStashState = () => {

  const [ logstashConnected, setlogstashConnected] = useState<boolean>(false);
  const logstashText = logstashConnected ? 'Logstash connected' : 'Logstash not connected';
  const logstashClass = logstashConnected ? 'success' : 'danger';

  useEffect(() => {
    const logstashStateInterval = setInterval(() => {
       getLogstashState(setlogstashConnected);
    }, 2000);
    return () => {
      clearInterval(logstashStateInterval)
    }
  },[])

  return (
    <button
      id="logstash-status"
      className={`btn btn-xs btn-${logstashClass} m-1 mt-3 py-1`}
    >
      {logstashText}
    </button>
  )
}

const getLogstashState = async (setLogStashConnected: (status: boolean) => void) => {

  console.log(Backend)
  try {
    let res = await fetch(`${Backend}/logstashStatus`)
    let logstashStatus = await res.json();

    if(!logstashStatus.logstashAPI){
      setLogStashConnected(false);
    } else {
      setLogStashConnected(true);
    }
  } catch(e){
    console.log('No response from backend');
  }
}

export default LogStashState;
