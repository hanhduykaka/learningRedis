const { check } = require('express-validator')
const config = require('./config')

exports.checkUser = [
    check('id').notEmpty().withMessage(`Field id ${config.msg.users.canNotBeEmpty}`),
    check('email').isEmail().withMessage(config.msg.users.invalidEmail),
    // password must be at least 8 chars long
    check('password').isLength({ min: 8 }).withMessage(config.msg.users.passAtLeast8Char)
]
