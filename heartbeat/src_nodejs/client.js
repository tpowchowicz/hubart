'use strict';
var thrift = require('thrift');
var Heartbeat = require('../gen-nodejs/Heartbeat.js');
var connection = thrift.createConnection('localhost', 9090, {
  transport: thrift.TBufferedTransport,
  protocol: thrift.TBinaryProtocol,
});
var client = thrift.createClient(Heartbeat, connection);
function onHeartbeatTimeout() {
  console.log('Heartbeat time-out.');
}

function ping() {
  var exitTimer = setTimeout(onHeartbeatTimeout, 1000);
  client.ping(function (err, response) {
    console.log(response);
    clearTimeout(exitTimer);
    setTimeout(ping, 1000);
  });
}

connection.on('error', function (err) {
  console.log('Connection error.');
});

ping();
