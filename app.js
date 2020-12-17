const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const { body, check, checkBody, validationResult } = require('express-validator');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
});

// Set Port
const port = 2300;

// Init app
const app = express();

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const secretKey = "meocondethuong";

app.use(expressJWT({ secret: secretKey, algorithms: ['HS256'] }).unless(
    {
        path: [
            '/api/v1/login',
            '/user/add' // ~~ register
        ]
    }

));

// get all User
app.get('/user', (req, res, next) => {    
    client.hgetall('users', function (err, obj) {
        if (!obj) {
            res.end(JSON.stringify({
                error: 'User does not exist'
            }));
        } else {
            let result = [];
            for (const [key, value] of Object.entries(obj)) {
               const user = JSON.parse(value);
               user.id = key;
                result.push(
                    user
                    );
              }
            res.end(JSON.stringify({
                users: result
            }));
        }
    })
});

// get User
app.get('/user/:id', (req, res, next) => {
    const id = req.params.id;
    client.hget('users', id, function (err, obj) {
        if (!obj) {
            res.end(JSON.stringify({
                error: 'User does not exist'
            }));
        } else {
            res.end(JSON.stringify({
                user:  JSON.parse(obj)
            }));
        }
    })
});

//  Add User 
app.post('/user/add',
    validateParam(),
    (req, res, next) => {
        let errorsResult = validationResult(req);
        const id = req.body.id;
        client.hget('users', id, (err, obj) => {
            if (obj) {
                var error =
                {
                    param: "id",
                    msg: `id:${id} already use`
                    , value: id
                };
                errorsResult.errors.push(error);
            }
            if (!errorsResult.isEmpty()) {
                return res.status(400).json({ errorsResult: errorsResult.array() });
            }
            setData(id, req, res);
        })
    });

//  Add User 
app.put('/user/:id',
    validateParam(),
    (req, res, next) => {
        let errorsResult = validationResult(req);
        const id = req.params.id;
        client.hget('users', id, (err, obj) => {
            if (!obj) {
                var error =
                {
                    param: "id",
                    msg: `User with id=${id} not exits`
                    , value: id
                };
                errorsResult.errors.push(error);
            }
            if (!errorsResult.isEmpty()) {
                return res.status(400).json({ errorsResult: errorsResult.array() });
            }
            setData(id, req, res);
        })
    });

// Delete User
app.delete('/user/:id', (req, res, next) => {
    client.hdel("users", req.params.id);
    res.end(JSON.stringify({
        status: res.statusCode,
        success: 'OK'
    }));
});

// api test token
app.post('/api/posts', (req, res) => {

    res.json({
        message: 'Post created...'
    });

});

// get token
app.post('/api/v1/login', (req, res) => {
    client.hget('users', req.body.id, function (err, obj) {
        if (!obj) {
            res.end(JSON.stringify({
                error: 'User does not exist',
                token: ''
            }));
        } else {
            const objModel = JSON.parse(obj);
            if (objModel.pass_word !== md5(req.body.pass_word)) {
                res.end(JSON.stringify({
                    error: 'Pass word not correct',
                    token: ''
                }));
            }
            jwt.sign({ objModel }, secretKey, { expiresIn: '360s', algorithm: 'HS256' }, (err, token) => {
                res.json({
                    token
                });
            });

        }
    })



});

//validate non-custom
function validateParam() {
    return [body('email').isEmail().withMessage("Invalid email"),
    // password must be at least 8 chars long
    body('pass_word').isLength({ min: 8 }).withMessage("password must be at least 8 character")]
}

//set data to redis
function setData(id, req, res) {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = req.body.age;
    let pass_word = req.body.pass_word;
    pass_word = md5(pass_word);
    var user = {
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'age': age,
        'pass_word': pass_word
    }
    client.hset("users", id, JSON.stringify(user)
        , function (err, reply) {
            if (err) {
                console.log(err)
                res.end(JSON.stringify({
                    status: res.statusCode,
                    success: 'Not success'
                }));
            }

            res.end(JSON.stringify({
                status: res.statusCode,
                success: 'OK'
            }));
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