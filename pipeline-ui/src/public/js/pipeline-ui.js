// This is written fast and ugly.
// Sorry.

$( document ).ready(function() {

    // Open a websocket to backend to get the logstash output
    connectToBackend();

    // Verify that logstash container is up and running
    setInterval(getLogstashStatus, 2000);

    // Collect the form data and send to the backend servers
    $('button#send-button').on('click', e => {
        $('div#logstash-result').html('');
        getColumnValue = (e, selector) => {
            return $(e.target).parent().parent().find(selector).val();
        };

        let sendString = getColumnValue(e, '#send-string');
        let port = getColumnValue(e, '#send-port');
        let protocol = getColumnValue(e, '#send-protocol');
        sendLogLines(sendString, port, protocol);
    });

    // Autosize in case someone has cached content that exceeds two rows
    $('textarea#send-string').on('keyup', autoSize);
    setTimeout(() => { triggerEvent('keyup', 'textarea#send-string')},500);
    preparePipelines();
});

function triggerEvent(e, s){
    "use strict";
    var event = document.createEvent('HTMLEvents');
    event.initEvent(e, true, true);
    document.querySelector(s).dispatchEvent(event);
}

async function preparePipelines() {
    let res = await fetch('/pipelines');
    let pipelines = await res.json();

    for(pipeline of pipelines){
        const { name, protocol, port } = pipeline;
        $('select#pipeline-select').append(`
            <option data-name="${name}" data-protocol="${protocol}" data-port="${port}">${name}</option>
        `);
    }

    $('select#pipeline-select').on('change', function(select) {
        const selectedOption = $('select#pipeline-select option:selected');
        $('input#send-port').val(selectedOption.attr('data-port'));
        $('select#send-protocol').val(selectedOption.attr('data-protocol'))
    });
}

async function getLogstashStatus(){
    try {
        let res = await fetch('/logstashStatus')
        let logstashStatus = await res.json();

        if(!logstashStatus.logstashAPI){
            $('#logstash-status').removeClass('btn-success').addClass('btn-warning').html('Waiting for logstash');
        } else {
            $('#logstash-status').removeClass('btn-warning').addClass('btn-success').html('Logstash ready');
        }

    } catch(e){
        console.log('No response from backend');
    }
}

function sendLogLines(sendString, port, protocol){
    fetch(
        '/send', {
            "method": 'POST', 
            "headers": {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({sendString: sendString, port: port, protocol: protocol})
        }
    )
}

function autoSize(){
    var el = this;
    setTimeout(function(){
      el.style.cssText = 'height:auto; padding:0';
      el.style.cssText = 'height:' + el.scrollHeight + 'px';
    },0);
  }

async function connectToBackend() {

    try {
        var ws = await new WebSocket("ws://localhost:8080/getLogs");
    } catch (err) {
        console.error("Unable to connect to the backend")
        throw "Unable to connec to the backend";
    }

    ws.onopen = function() {
        $('#backend-status').removeClass('btn-danger').addClass('btn-success').html('Backend connected');
    };
    
    ws.onmessage = function (evt) {
        var received_msg = evt.data;
        console.log(received_msg);
        $('div#logstash-result')
            .append(`<div class="log-message">${received_msg}</div>`)
        $('div.log-message').rainbowJSON();
    };

    ws.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    }
    
    ws.onclose = function() { 
        $('#backend-status').removeClass('btn-success').addClass('btn-danger').html('Backend not connected');
        let t = setInterval(async () => {
            try {
                await connectToBackend();
                clearInterval(t);
            } catch (e) {
                console.error("Reconnect failed");
                throw "Reconnect failed"
            };
        }, 1000);
    };

}

// Save form data before refresh
window.onbeforeunload = function() {
    localStorage.setItem("send-string", $('textarea#send-string').val());
    localStorage.setItem("send-port", $('input#send-port').val());
    localStorage.setItem("send-protocol", $('select#send-protocol').val());
}

// Restore form data after load
window.onload = function() {

    let sendString = localStorage.getItem("send-string");
    let port = localStorage.getItem("send-port");
    let protocol = localStorage.getItem("send-protocol");

    if(typeof(sendString) !== undefined){ $('textarea#send-string').val(sendString); }
    if(typeof(port) !== undefined){ $('input#send-port').val(port); }
    if(typeof(protocol) !== undefined){ $('select#send-protocol').val(protocol); }

}
