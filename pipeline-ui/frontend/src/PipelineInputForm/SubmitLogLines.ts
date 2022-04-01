import BACKEND from '../Util/Backend';

export function SubmitLogLines(
  logLines: string,
  port: string,
  protocol: string,
) {
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
