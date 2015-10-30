'use strict';

let cluster = require('cluster');
let redis = require('redis');
let os = require('os');

const REQUESTS = process.argv.length > 2 ? parseInt(process.argv[2]) : 50000;
const PRINT_EACH = process.argv.length > 3 ? parseInt(process.argv[3]) : 5000;

if (cluster.isMaster) {
  os.cpus().forEach(() => cluster.fork());
}
else {
  let client = redis.createClient();

  let workerId = cluster.worker.id;
  let requestId = 1;

  let send = () => {
    if (!(requestId % PRINT_EACH)) {
      console.log(`worker: ${workerId}, request: ${requestId}`);
    }

    client.publish(`queue-${workerId}-${requestId}`, 'message');

    setTimeout(requestId++ < REQUESTS ? send : () => {
      client.quit();
      process.exit();
    }, 0);
  };

  send();
}
