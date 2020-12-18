
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../config');
const client = require('../redisClient');
const secretKey = config.secretKey;

// get all Users
function getUsers(req, res) {
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
}

// get User by id
function getUserById(req, res) {
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
}

//  Add User 
function postUser(req, res) {    
    var errorsResult = validationResult(req);   
    const id = req.body.id;
    client.hget(config.tblUserName, id, (err, obj) => {
        if (obj) {
            const error =
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
        setData(client, id, req, res);
    })
}

//  edit User 
function putUser(req, res) {  
    let errorsResult = validationResult(req);
    const id = req.params.id;
    client.hget(config.tblUserName, id, (err, obj) => {
        if (!obj) {
            const error =
            {
                msg: `${config.msg.users.userWithId} ${id} ${config.msg.users.doesNotExist}`
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
        setData(client, id, req, res);
    })
}

//delete User
function deleteUser(req, res) {
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
}

// get token
function getToken(req, res) {
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
            console.log(objModel)
            console.log(md5(req.body.password))

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
}

//set data to redis
function setData(client, id, req, res) {
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

module.exports = { getUsers, getUserById, postUser, putUser, deleteUser, getToken }

