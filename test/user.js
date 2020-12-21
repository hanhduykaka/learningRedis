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

    describe('GET all Users when empty data', () => {
        it('it should return empty data', (done) => {
            chai.request(app).get(config.url.users.getAll).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('msg');
                res.body.should.have.property('data');
                res.body.should.have.property('statusCode');
                res.body.msg.should.eql(config.msg.users.doesNotHaveAny);
                done();
            })
        });
    });

    describe('POST User', () => {

        it('it should not post with invalid email', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen',
                age: 14,
                password: '12345678'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                should.equal(res.body.msg, `${config.msg.badRequest} ${config.msg.users.invalidEmail}`);
                done();
            })
        });

        it('it should not post with empty field email', (done) => {
            let user = {
                id: 'tainguyen2020',
                first_name: 'teo',
                last_name: 'nguyen',
                age: 14,
                password: '1234567'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.email} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with password less than 8 char', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '1234567'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.passAtLeast8Char}`);
                done();
            })
        });

        it('it should not post with password empty', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with confirm password empty', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '12345678'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.confirm_password} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not post with confirm password and password mismatch', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '12345678',
                confirm_password: '123'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.confirmPasswordMismatch}`);
                done();
            })
        });

        it('it should not post with empty field id', (done) => {
            let user = {
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '1234567'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.id} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
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
                    chai.request(app).get(config.url.users.user + id).send(user).end((err, res) => {
                        res.should.have.status(200);
                        should.equal(res.body.msg, config.msg.ok);
                        res.body.data.should.be.a('object');
                        res.body.data.should.have.property('user');
                        res.body.data.user.should.be.a('object');
                        should.equal(res.body.data.user.id, id);
                        should.equal(res.body.data.user.password, user[config.users.password]);
                        done();
                    })
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
            let user = {
                id: 'tainguyen2020',
                first_name: 'teo',
                last_name: 'nguyen',
                age: 14,
                password: '1234567'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.email} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not put with password less than 8 char', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '1234567'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.passAtLeast8Char}`);
                done();
            })
        });

        it('it should not put with password empty', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not put with confirm password empty', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '12345678'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should
                    .eql(`${config.msg.badRequest} ${config.msg.field} ${config.users.confirm_password} ${config.msg.users.canNotBeEmpty}`);
                done();
            })
        });

        it('it should not put with confirm password and password mismatch', (done) => {
            let user = {
                id: '1',
                first_name: 'teo',
                last_name: 'nguyen',
                email: 'teonguyen@gmail.com',
                age: 14,
                password: '12345678',
                confirm_password: '123'
            }
            chai.request(app).post(config.url.users.add).send(user).end((err, res) => {
                res.should.have.status(400);
                should.equal(res.body.data, null);
                res.body.msg.should.eql(`${config.msg.badRequest} ${config.msg.users.confirmPasswordMismatch}`);
                done();
            })
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
            })
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
                        })
                        done();

                    })
                });
        });

    });

});