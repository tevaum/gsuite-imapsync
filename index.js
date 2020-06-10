const Queue = require('bull');

const queue = new Queue('gsuite-migration');

// const processMigrate = require('./process-migrate');
// queue.process('migrate', processMigrate);
queue.process('migrate', 41, '/srv/migra-ufvjm/worker/process-migrate.js');
