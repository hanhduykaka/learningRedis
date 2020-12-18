const express = require('express');
const bodyParser = require('body-parser');
const expressJWT = require('express-jwt');
const config = require('./config');

// Set Port
const port = config.port;

// Init app
const app = express();

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('./router'));

const secretKey = config.secretKey;

app.use(expressJWT({
    secret: secretKey, algorithms: [config.algorithms]
}).unless(
    {
        path: [
            '/api/v1/login',
            '/user/add' // ~~ register
        ]
    }
));

app.get('*', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.end("Please try again with another source api");
});

app.listen(port, function () {
    console.log('Server started on port ' + port);
});

module.exports = app;