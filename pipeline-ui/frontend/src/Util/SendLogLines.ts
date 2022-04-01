const sendLogLines = (sendString: string, port: string, protocol: string) => {
  fetch('/send', {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'body': JSON.stringify(
      {sendString: sendString, port: port, protocol: protocol},
    ),
  },
  );
};

export default sendLogLines;
