'use strict';

let process = require('process');
let redis = require('redis');

let exit = !process.argv[2] ? () => {
  client.quit();
  process.exit();
} : () => requests.clear();

let client = redis.createClient();
let requests = new Map();

let print = () => {
  console.log('received requests:');
  requests.forEach((value, key) => console.log(`worker ${key}: ${value}`));
  exit();
};

let timeout;

client.on('pmessage', (pattern, channel) => {
  let worker = channel.split('-')[1];

  requests.set(worker, (requests.get(worker) || 0) + 1);

  clearTimeout(timeout);
  timeout = setTimeout(print, 100);
});

client.psubscribe('queue*');
