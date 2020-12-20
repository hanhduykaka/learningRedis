const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
const client = require('../redisClient');
const config = require('../config');

chai.use(chaiHttp);

describe(config.tblUserName, () => {

    //before each test we need empty the table
    beforeEach((done) => {
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

    describe('POST  User', () => {

        it('it should not Post with invalid email', (done) => {
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

        it('it should not Post with empty field email', (done) => {
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

        it('it should not Post with password less than 8 char', (done) => {
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

        it('it should not Post with password empty', (done) => {
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

        it('it should not Post with confirm password empty', (done) => {
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

        it('it should not Post with confirm password and password mismatch', (done) => {
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

        it('it should not Post with empty field id', (done) => {
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



    });

});