const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
const client = require('../redisClient');
const config = require('../config');
const md5 = require('md5');

chai.use(chaiHttp);

describe(config.tblUserName, () => {

    //before each test we need empty the table
    beforeEach((done) => {
        client.del(config.tblUserName);
        done();
    });

    //after each test we need empty the table
    afterEach((done) => {
        client.del(config.tblUserName);
        done();
    });

    describe('GET all Users', () => {

        it('it should return empty data', (done) => {
            chai.request(app).get(config.url.users.getAll).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('msg');
                res.body.should.have.property('data');
                res.body.should.have.property('statusCode');
                res.body.msg.should.eql(config.msg.users.doesNotHaveAny);
                done();
            });
        });

        it('it should return all user', (done) => {
            const id = '1';
            let user = {};
            user[config.users.first_name] = 'teo';
            user[config.users.id] = id;
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            client.hset(config.tblUserName, id, JSON.stringify(user)
                , function (err, reply) {
                    chai.request(app).get(config.url.users.getAll).end((err, res) => {
                        res.should.have.status(200);
                        should.equal(res.body.msg, config.msg.ok);
                        res.body.data.should.be.a('object');
                        res.body.data.should.have.property('users');
                        res.body.data.users.should.be.a('array');
                        should.equal(res.body.data.users.length, 1);
                        should.equal(res.body.data.users[0].password, user[config.users.password]);
                        should.equal(res.body.data.users[0].age, user[config.users.age]);
                        should.equal(res.body.data.users[0].email, user[config.users.email]);
                        should.equal(res.body.data.users[0].first_name, user[config.users.first_name]);
                        should.equal(res.body.data.users[0].last_name, user[config.users.last_name]);
                        done();
                    });
                });
        });

    });

    describe('POST User', () => {

        it('it should not post with invalid email', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('12345678');
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                should.equal(res.body.msg, `${config.msg.badRequest} ${config.msg.users.invalidEmail}`);
                done();
            });
        });

        it('it should not post with empty field email', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('12345678');
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.email} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with password less than 8 char', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '1234567';
            user[config.users.confirm_password] = '1234567';
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.passAtLeast8Char}`);
                done();
            })
        });

        it('it should not post with password empty', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with confirm password empty', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.confirm_password} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with confirm password and password mismatch', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('1234567');
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.confirmPasswordMismatch}`);
                done();
            })
        });

        it('it should not post with empty field id', (done) => {
            let user = {};
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('12345678');
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.id} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with id is already used', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('12345678');
            client.hset(config.tblUserName, id, JSON.stringify(user)
                , function (err, reply) {
                    chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                        res.should.have.status(400);
                        should.equal(res.body.data, null);
                        res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.userWithId} ${id} ${config.msg.users.alreadyUse}`);
                        done();
                    })
                });
        });

        it('it should post a user', (done) => {
            let user = {};
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '12345678';
            user[config.users.confirm_password] = '12345678';
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(200);
                should.equal(res.body.msg, config.msg.ok);
                done();
            })
        });

    });

    describe('/GET/:id User', () => {

        it('it should GET a user by the given id', (done) => {
            const id = '1';
            let user = {};
            user[config.users.first_name] = 'teo';
            user[config.users.id] = id;
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            client.hset(config.tblUserName, id, JSON.stringify(user)
                , function (err, reply) {
                    chai.request(app).get(config.url.users.user + id).end((err, res) => {
                        res.should.have.status(200);
                        should.equal(res.body.msg, config.msg.ok);
                        res.body.data.should.be.a('object');
                        res.body.data.should.have.property('user');
                        res.body.data.user.should.be.a('object');
                        should.equal(res.body.data.user.id, id);
                        should.equal(res.body.data.user.password, user[config.users.password]);
                        should.equal(res.body.data.user.age, user[config.users.age]);
                        should.equal(res.body.data.user.email, user[config.users.email]);
                        should.equal(res.body.data.user.first_name, user[config.users.first_name]);
                        should.equal(res.body.data.user.last_name, user[config.users.last_name]);
                        done();
                    })
                });
        });

        it('it should not GET a user by the given id does not exits', (done) => {
            const id = '1';
            chai.request(app).get(config.url.users.user + id).end((err, res) => {
                res.should.have.status(200);
                should.equal(res.body.msg, config.msg.users.userDoesNotExist);
                done();
            });
        });

    });

    describe('PUT User', () => {

        it('it should not put with invalid email', (done) => {
            const id = '1';
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('12345678');
            client.hset(config.tblUserName, id, JSON.stringify(user)
                , function (err, reply) {
                    chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                        res.should.have.status(400);
                        should.equal(res.body.data, null);
                        should.equal(res.body.msg, `${config.msg.badRequest} ${config.msg.users.invalidEmail}`);
                        done();
                    })
                });
        });

        it('it should not put with empty field email', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.age] = 14;
            user[config.users.password] = '12345678';
            user[config.users.confirm_password] = '12345678';
            client.hset(config.tblUserName, id, JSON.stringify(user), (err, reply) => {
                chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                    res.should.have.status(400);
                    should.equal(res.body.data, null);
                    res.body.msg.should
                        .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.email} ${config.msg.users.canNotBeEmpty}`);
                    done();
                });
            });
        });

        it('it should not put with password less than 8 char', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '1234567';
            client.hset(config.tblUserName, id, JSON.stringify(user), (err, reply) => {
                chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                    res.should.have.status(400);
                    should.equal(res.body.data, null);
                    res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.passAtLeast8Char}`);
                    done();
                });
            });
        });

        it('it should not put with password empty', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            client.hset(config.tblUserName, id, JSON.stringify(user), (err, reply) => {
                chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                    res.should.have.status(400);
                    should.equal(res.body.data, null);
                    res.body.msg.should
                        .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`);
                    done();
                });
            });
        });

        it('it should not put with confirm password empty', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '12345678';
            client.hset(config.tblUserName, id, JSON.stringify(user), (err, reply) => {
                chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                    res.should.have.status(400);
                    should.equal(res.body.data, null);
                    res.body.msg.should
                        .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.confirm_password} ${config.msg.users.canNotBeEmpty}`);
                    done();
                });
            });
        });

        it('it should not put with confirm password and password mismatch', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '12345678';
            user[config.users.confirm_password] = '123';
            client.hset(config.tblUserName, id, JSON.stringify(user), (err, reply) => {
                chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                    res.should.have.status(400);
                    should.equal(res.body.data, null);
                    res.body.msg.should
                        .eql(`${config.msg.badRequest} ${config.msg.users.confirmPasswordMismatch}`);
                    done();
                });
            });
        });

        it('it should not put with id not exist in redis', (done) => {
            const id = '1'
            let user = {};
            user[config.users.id] = id;
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = md5('12345678');
            user[config.users.confirm_password] = md5('12345678');
            chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.badRequest} ${config.msg.users.userWithId} ${id} ${config.msg.users.doesNotExist}`);
                done();
            });
        });

        it('it should UPDATE a user given the id', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '12345678';
            user[config.users.confirm_password] = '12345678';
            client.hset(config.tblUserName, id, JSON.stringify(user)
                , function (err, reply) {
                    user[config.users.email] = 'teonguyen2020@gmail.com';
                    chai.request(app).put(config.url.users.user + id).send(user).end((err, res) => {
                        res.should.have.status(200);
                        should.equal(res.body.data, null);
                        client.hget(config.tblUserName, id, (err, reply) => {
                            let updateUser = JSON.parse(reply)
                            should.equal(updateUser.email, user[config.users.email]);
                        });
                        done();
                    });
                });
        });

    });

    describe('DELETE User', () => {

        it('it should not delete user given the id is not exits', (done) => {
            const id = '1'
            chai.request(app).delete(config.url.users.user + id).end((err, res) => {
                res.should.have.status(200);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.users.userWithId} ${id} ${config.msg.users.doesNotExist}`);
                done();
            });
        });

        it('it should delete a user given the id', (done) => {
            let user = {};
            const id = '1';
            user[config.users.id] = '1';
            user[config.users.first_name] = 'teo';
            user[config.users.last_name] = 'nguyen';
            user[config.users.email] = 'teonguyen@gmail.com';
            user[config.users.age] = 14;
            user[config.users.password] = '12345678';
            user[config.users.confirm_password] = '12345678';
            client.hset(config.tblUserName, id, JSON.stringify(user)
                , function (err, reply) {
                    chai.request(app).delete(config.url.users.user + id).end((err, res) => {
                        res.should.have.status(200);
                        should.equal(res.body.data, null);
                        res.body.msg.should.eql(config.msg.ok);
                        client.hget(config.tblUserName, id, (err, reply) => {                       
                            should.equal(reply, null);
                        });
                        done();
                    });
                });
        });

    });

    describe('GET TOKEN', () => {

        it('it should not get the token when empty field id', (done) => {
            const loginInfo= { };
            loginInfo[config.users.password] = '12345678';
            chai.request(app).post(config.url.login).send(loginInfo).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.id} ${config.msg.users.canNotBeEmpty}`);
                done();
            });
        });

        it('it should not get the token when empty field password', (done) => {
            const loginInfo= { };
            loginInfo[config.users.id] = '1';
            chai.request(app).post(config.url.login).send(loginInfo).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`);
                done();
            });
        });

        it('it should not get the token when given the id does not exists', (done) => {
            const loginInfo= { };
            loginInfo[config.users.id] = 'abc';
            loginInfo[config.users.password] = '12345678';
            chai.request(app).post(config.url.login).send(loginInfo).end((err, res) => {
                res.should.have.status(200);
                res.body.data.should.be.a('object');            
                should.equal(res.body.data.token, '');
                res.body.msg.should
                    .eql(config.msg.users.userDoesNotExist);
                done();
            });
        });

        it('it should not get the token when given the password is not correct', (done) => {
            const loginInfo= { };
            loginInfo[config.users.id] = '1';          
            loginInfo[config.users.password] = md5('12345678');
            client.hset(config.tblUserName, loginInfo[config.users.id], JSON.stringify(loginInfo)
            , function (err, reply) {
                loginInfo[config.users.password] = '1234567';
                chai.request(app).post(config.url.login).send(loginInfo).end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.a('object');            
                    should.equal(res.body.data.token, '');
                    res.body.msg.should
                        .eql(config.msg.users.passwordNotCorrect);
                    done();
                });
            });
        });

        it('it should return the token', (done) => {
            const loginInfo= { };
            loginInfo[config.users.id] = '1';          
            loginInfo[config.users.password] = md5('12345678');
            client.hset(config.tblUserName, loginInfo[config.users.id], JSON.stringify(loginInfo)
            , function (err, reply) {
                loginInfo[config.users.password] = '12345678';
                chai.request(app).post(config.url.login).send(loginInfo).end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.a('object');            
                    should.not.equal(res.body.data.token, '');
                    res.body.msg.should
                        .eql(config.msg.ok);
                    done();
                });
            });
        });

    });

});