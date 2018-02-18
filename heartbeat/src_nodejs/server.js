'use strict';
var thrift = require('thrift');
var Heartbeat = require('../gen-nodejs/Heartbeat.js');
var server = thrift.createServer(Heartbeat, {
  ping: function (result) {
    console.log('Ping!');
    result(null, 'Pong');
  },
});

server.listen(9090);
