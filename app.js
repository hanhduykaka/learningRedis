const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const { body, validationResult } = require('express-validator');
const config = require('./config');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
});

// Set Port
const port = config.port;

// Init app
const app = express();

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

// get all Users
app.get('/user', (req, res, next) => {
    client.hgetall(config.tblUserName, function (err, obj) {
        if (!obj) {
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: config.msg.users.doesNotHaveAny,
                    data: null
                });

        } else {
            let result = [];
            for (const [key, value] of Object.entries(obj)) {
                const user = JSON.parse(value);
                user.id = key;
                result.push(
                    user
                );
            }
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: config.msg.ok,
                    data: { users: result }
                });
        }
    })
});

// get User by id
app.get('/user/:id', (req, res, next) => {
    const id = req.params.id;
    client.hget(config.tblUserName, id, function (err, obj) {
        if (!obj) {
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: config.msg.users.userDoesNotExist,
                    data: null
                });
        } else {
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: config.msg.ok,
                    data: { user: JSON.parse(obj) }
                });
        }
    })
});

//  Add User 
app.post('/user/add',
    validateParam(),
    (req, res, next) => {
        let errorsResult = validationResult(req);
        const id = req.body.id;
        client.hget(config.tblUserName, id, (err, obj) => {
            if (obj) {
                var error =
                {
                    msg: `${config.msg.users.userWithId} ${id} ${config.msg.users.alreadyUse}`
                };
                errorsResult.errors.push(error);
            }
            if (!errorsResult.isEmpty()) {
                return res.status(400).json(
                    {
                        statusCode: 400,
                        msg: `${config.msg.badRequest} ${errorsResult.errors[0].msg}`,
                        data: null
                    });
            }
            setData(id, req, res);
        })
    });

//  edit User 
app.put('/user/:id',
    validateParam(),
    (req, res, next) => {
        let errorsResult = validationResult(req);
        const id = req.params.id;
        client.hget(config.tblUserName, id, (err, obj) => {
            if (!obj) {
                var error =
                {
                    msg: `${config.msg.userWithId} ${id} ${config.msg.doesNotExist}`
                };
                errorsResult.errors.push(error);
            }
            if (!errorsResult.isEmpty()) {

                return res.status(400).json(
                    {
                        statusCode: 400,
                        msg: `${config.msg.badRequest} ${errorsResult.errors[0].msg}`,
                        data: null
                    });
            }
            setData(id, req, res);
        })
    });

// Delete User
app.delete('/user/:id', (req, res, next) => {
    const id = req.params.id;
    client.hget(config.tblUserName, id, function (err, obj) {
        if (obj) {
            client.hdel(config.tblUserName, id);
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: config.msg.ok,
                    data: null
                });
        } else {
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: `${config.msg.users.userWithId} ${id} ${config.msg.users.doesNotExist}`,
                    data: null
                });
        }
    });
});

// api test token
app.post('/api/posts', (req, res) => {
    res.json({
        statusCode: 200,
        msg: 'Test success',
        data: null
    });
});

// get token
app.post('/api/v1/login', (req, res) => {
    client.hget(config.tblUserName, req.body.id, function (err, obj) {
        if (!obj) {
            return res.status(200).json(
                {
                    statusCode: 200,
                    msg: config.msg.users.userDoesNotExist,
                    data: { token: '' }
                });
        } else {
            const objModel = JSON.parse(obj);
            if (objModel.password !== md5(req.body.password)) {
                return res.status(200).json(
                    {
                        statusCode: 200,
                        msg: config.msg.users.passwordNotCorrect,
                        data: { token: '' }
                    });
            }
            jwt.sign(
                { objModel },
                secretKey,
                { expiresIn: config.timeOut, algorithm: config.algorithms },
                (err, token) => {
                    return res.status(200).json(
                        {
                            statusCode: 200,
                            msg: config.msg.ok,
                            data: { token: token }
                        });
                
                });
        }
    })
});

//validate non-custom
function validateParam() {
    return [body('email').isEmail().withMessage(config.msg.users.invalidEmail),
    // password must be at least 8 chars long
    body('password').isLength({ min: 8 }).withMessage(config.msg.users.passAtLeast8Char)]
}

//set data to redis
function setData(id, req, res) {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = req.body.age;
    let password = req.body.password;
    password = md5(password);
    var user = {
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'age': age,
        'password': password
    };
    client.hset(config.tblUserName, id, JSON.stringify(user)
        , function (err, reply) {
            if (err) {
                console.log(err)
                return res.status(res.statusCode).json(
                    {
                        statusCode: res.statusCode,
                        msg: config.msg.notSuccess,
                        data: null
                    });
            }
            return res.status(res.statusCode).json(
                {
                    statusCode: res.statusCode,
                    msg: config.msg.ok,
                    data: null
                });
        });
}

app.get('*', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.end("Please try again with another source api");
});

app.listen(port, function () {
    console.log('Server started on port ' + port);
});