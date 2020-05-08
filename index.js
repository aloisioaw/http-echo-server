#!/usr/bin/env node
'use strict'

var getPort = require('get-port')
var server = require('net').createServer()

var cid = 0

module.exports = server // for testing

var httpCodes = new Map();
httpCodes.set(100, 'Continue'); 
httpCodes.set(101, 'Switching Protocols'); 
httpCodes.set(200, 'OK'); 
httpCodes.set(201, 'Created'); 
httpCodes.set(202, 'Accepted'); 
httpCodes.set(203, 'Non-Authoritative Information'); 
httpCodes.set(204, 'No Content'); 
httpCodes.set(205, 'Reset Content'); 
httpCodes.set(206, 'Partial Content'); 
httpCodes.set(300, 'Multiple Choices'); 
httpCodes.set(301, 'Moved Permanently'); 
httpCodes.set(302, 'Found'); 
httpCodes.set(303, 'See Other'); 
httpCodes.set(304, 'Not Modified'); 
httpCodes.set(305, 'Use Proxy'); 
httpCodes.set(307, 'Temporary Redirect'); 
httpCodes.set(400, 'Bad Request'); 
httpCodes.set(401, 'Unauthorized'); 
httpCodes.set(402, 'Payment Required'); 
httpCodes.set(403, 'Forbidden'); 
httpCodes.set(404, 'Not Found'); 
httpCodes.set(405, 'Method Not Allowed'); 
httpCodes.set(406, 'Not Acceptable'); 
httpCodes.set(407, 'Proxy Authentication Required'); 
httpCodes.set(408, 'Request Time-out'); 
httpCodes.set(409, 'Conflict'); 
httpCodes.set(410, 'Gone'); 
httpCodes.set(411, 'Length Required'); 
httpCodes.set(412, 'Precondition Failed'); 
httpCodes.set(413, 'Request Entity Too Large'); 
httpCodes.set(414, 'Request-URI Too Large'); 
httpCodes.set(415, 'Unsupported Media Type'); 
httpCodes.set(416, 'Requested range not satisfiable'); 
httpCodes.set(417, 'Expectation Failed'); 
httpCodes.set(500, 'Internal Server Error'); 
httpCodes.set(501, 'Not Implemented'); 
httpCodes.set(502, 'Bad Gateway'); 
httpCodes.set(503, 'Service Unavailable'); 
httpCodes.set(504, 'Gateway Time-out'); 
httpCodes.set(505, 'HTTP Version not supported'); 

onEmit(server, { ignore: ['connection', 'listening', 'error'] }, function (eventName) {
  console.log('[server] event:', eventName)
})

server.on('connection', function (c) {
  var gotData = false
  var _cid = ++cid

  console.log('[server] event: connection (socket#%d)', _cid)

  onEmit(c, { ignore: ['lookup', 'error'] }, function (eventName) {
    console.log('[socket#%d] event:', _cid, eventName)
  })

  c.on('lookup', function (err, address, family) {
    if (err) {
      console.log('[socket#%d] event: lookup (error: %s)', _cid, err.message)
    } else {
      console.log('[socket#%d] event: lookup (address: %s, family: %s)', _cid, address, family)
    }
  })

  c.on('data', function (chunk) {
    console.log('--> ' + chunk.toString().split('\n').join('\n--> '))

    c.write('HTTP/1.1 ' + httpCodeToAppend())

    if (!gotData) {
      gotData = true
      c.write('Date: ' + (new Date()).toString() + '\r\n')
      c.write('Connection: close\r\n')
      c.write('Content-Type: text/plain\r\n')
      c.write('Access-Control-Allow-Origin: *\r\n')
      c.write('\r\n')
      setTimeout(function () {
        c.end()
      }, 2000)
    }

    //c.write(chunk.toString())
  })

  c.on('error', function (err) {
    console.log('[socket#%d] event: error (msg: %s)', _cid, err.message)
  })
})

server.on('listening', function () {
  var port = server.address().port
  console.log('[server] event: listening (port: %d)', port)
})

server.on('error', function (err) {
  console.log('[server] event: error (msg: %s)', err.message)
})

var port = process.argv[2] || process.env.PORT
var httpCode = process.argv[3] || process.env.HTTP_CODE || 200;
httpCode = parseInt(httpCode)
console.log('Will answer with HTTP Code ' + httpCode)

if (port) {
  server.listen(port)
} else {
  getPort({ port: 3000 }).then(function (port) {
    server.listen(port)
  })
}

function onEmit (emitter, opts, cb) {
  var emitFn = emitter.emit
  emitter.emit = function (eventName) {
    if (opts.ignore.indexOf(eventName) === -1) cb.apply(null, arguments)
    return emitFn.apply(emitter, arguments)
  }
}

function httpCodeToAppend() {
  return httpCode + ' ' + httpCodes.get(httpCode) + '\r\n'
}