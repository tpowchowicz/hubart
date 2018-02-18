'use strict';
var thrift = require('thrift');
var Worker = require('../gen-nodejs/Worker.js');
var ttypes = require('../gen-nodejs/Worker_types.js');
var client = thrift.createClient(Worker, connection);

var ENCYPTED_MESSAGE = 'kbcwfxgutniyckfsbberfxioagdfomclihhugqbpixptsjvaiqqihlc';
const KEY_LENGTH = 8;
const STOP_COUNT = 4;

function toRadix(N, radix, keyLength) {
  let result = [];
  let R;
  while (true) {
    R = N % radix;
    result.push(R);
    N = Math.floor((N - R) / radix);
    if (N == 0) {
      break;
    }

  }

  while (result.length < keyLength) {
    result.push(0);
  }

  return result;
}

function decrypt(range) {
  let passwd = [];
  for (let j = range.first; j <= range.last; j++) {
    let radix = 26;
    let shift = toRadix(j, radix, KEY_LENGTH);
    let result = '';
    for (let i = 0; i < ENCYPTED_MESSAGE.length; ++i) {
      let value = (ENCYPTED_MESSAGE[i].charCodeAt() - 'a'.charCodeAt()
          - shift[i % shift.length] + radix) % radix + 'a'.charCodeAt();
      result += String.fromCharCode(value);
    }

    let count = 0;
    let pos = result.indexOf('stop');
    while (pos > -1) {
      ++count;
      pos = result.indexOf('stop', pos + 'stop'.length);
    }

    if (count >= STOP_COUNT) {
      console.log(j + ' ' + result);
      passwd.push(result);
    }
  }

  return passwd;
}

function calc(workerId) {
  client.reserve().then(range => {
    console.log(range);
    if (range.last == 0) {
      console.log('Logout: ' + workerId);
      client.logout(workerId);
    } else {
      client.report(range, decrypt(range)).then(function () {
        setImmediate(function () {
          calc(workerId);
        });
      });
    }
  });
}

var connection = thrift.createConnection('localhost', 9090, {
  transport: thrift.TBufferedTransport,
  protocol: thrift.TBinaryProtocol,
});

connection.on('error', function (err) {
  console.log('Connection error.');
});

client.login().then(workerId => {
  console.log('WorkerId: ' + workerId);
  calc(workerId);
});

//process.stdout._handle.setBlocking(true);
