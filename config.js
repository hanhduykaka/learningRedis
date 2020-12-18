const config = {};

//port env
config.port = 2300;

//JWT 
config.secretKey = 'meocondethuong';
config.algorithms = 'HS256';
config.timeOut = '360s';

//table users 
config.tblUserName = 'Users';

config.msg = {};

//msg general
config.msg.ok = 'OK';
config.msg.badRequest = 'Bad request';
config.msg.notSuccess = 'Not success';

//msg for user
config.msg.users = {};
config.msg.users.userDoesNotExist = 'User does not exists';
config.msg.users.doesNotHaveAny = 'Does not have any users';
config.msg.users.doesNotExist = 'does not exists';
config.msg.users.userWithId = 'User with id:';
config.msg.users.passwordNotCorrect = 'Password not correct';
config.msg.users.invalidEmail = 'Invalid Email';
config.msg.users.passAtLeast8Char = 'Password must be at least 8 character';
config.msg.users.alreadyUse = 'already use';

module.exports = config;