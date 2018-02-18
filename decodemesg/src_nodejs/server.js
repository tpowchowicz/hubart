'use strict';
var thrift = require('thrift');
var Worker = require('../gen-nodejs/Worker.js');
var ttypes = require('../gen-nodejs/Worker_types.js');

const SEGMENT = Math.pow(26, 4);
const MAX = Math.pow(26, 8);

var foundedList = [];
var workers = [];
var lastRange = new ttypes.WorkerRange;
var nextWorkerId = 0;
lastRange.first = 0;
lastRange.last = SEGMENT;

var server = thrift.createServer(Worker, {
  login: function (result) {
    nextWorkerId++;
    console.log('login: ', nextWorkerId);
    workers.push(nextWorkerId);
    result(null, 'client_' + nextWorkerId);
  },

  logout: function (id, result) {
    console.log('logout:', id);
    var index = workers.indexOf(id);
    if (index !== -1) workers.splice(index, 1);
    result(null);
  },

  reserve: function (result) {
    var range = new ttypes.WorkerRange;
    range.first = lastRange.first;
    range.last = lastRange.first >= MAX ? 0 : lastRange.last - 1;
    lastRange.first += SEGMENT;
    lastRange.last += SEGMENT;
    result(null, range);
  },

  report: function (workerRange, list, result) {
    foundedList = foundedList.concat(list);
    result(null);
  },
});
server.listen(9090);

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  var value = 'Progress: ' + (lastRange.first * 100 / MAX).toFixed(3) + ' % of combinations.\n';
  value += 'Last range: ' + lastRange.last + '\n';
  value += 'Workers: ' + workers + '\n';
  value += 'Secret: \n';
  for (let item of foundedList) {
    value += item + '\n';
  }

  res.end(value);
}).listen(8000, '0.0.0.0');
