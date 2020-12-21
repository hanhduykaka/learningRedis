const { check } = require('express-validator')
const config = require('./config')

exports.checkUser = [
    check(config.users.id)
        .not().isEmpty()
        .withMessage(`${config.msg.field} ${config.users.id} ${config.msg.users.canNotBeEmpty}`)
    ,
    check(config.users.email)
        .not().isEmpty().withMessage(`${config.msg.field} ${config.users.email} ${config.msg.users.canNotBeEmpty}`)
        .isEmail().withMessage(config.msg.users.invalidEmail),
    check(config.users.password)
        .not().isEmpty().withMessage(`${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`)
        .isLength({ min: 8 }).withMessage(config.msg.users.passAtLeast8Char),
    check(config.users.confirm_password)
        .not().isEmpty()
        .withMessage(`${config.msg.field} ${config.users.confirm_password} ${config.msg.users.canNotBeEmpty}`)
        .custom((value, { req }) => {
            if (value !== req.body[config.users.password]) {
                return false;
            }
            return true;
        }).withMessage(config.msg.users.confirmPasswordMismatch)

]

exports.checkLogin = [
    check(config.users.id)
    .not().isEmpty()
    .withMessage(`${config.msg.field} ${config.users.id} ${config.msg.users.canNotBeEmpty}`),
    check(config.users.password)
    .not().isEmpty()
    .withMessage(`${config.msg.field} ${config.users.password} ${config.msg.users.canNotBeEmpty}`)
]