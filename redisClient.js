const redis = require('redis');
// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
});



module.exports = client;