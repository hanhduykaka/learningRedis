const config = {};

//port env
config.port = 2300;

//JWT 
config.secretKey = 'meocondethuong';
config.algorithms = 'HS256';
config.timeOut = '360s';

//table users 
config.tblUserName = 'Users';

//users field name
config.users = {};
config.users.id = 'id';
config.users.first_name = 'first_name';
config.users.last_name = 'last_name';
config.users.email = 'email';
config.users.age = 'age';
config.users.password = 'password';
config.users.confirm_password = 'confirm_password';


//url router
config.url = {};
config.url.login = '/api/v1/login';

//url for users
config.url.users = {};
config.url.users.user = '/user/';
config.url.users.add = '/user/add';
config.url.users.getAll = '/user';
config.url.users.byId = '/user/:id';

//message
config.msg = {};

//msg general
config.msg.ok = 'OK';
config.msg.badRequest = 'Bad request';
config.msg.notSuccess = 'Not success';
config.msg.field = 'Field';


//msg for user
config.msg.users = {};
config.msg.users.userDoesNotExist = 'User does not exists';
config.msg.users.doesNotHaveAny = 'Does not have any users';
config.msg.users.doesNotExist = 'does not exists';
config.msg.users.userWithId = 'User with id:';
config.msg.users.passwordNotCorrect = 'Password not correct';
config.msg.users.invalidEmail = 'Invalid Email';
config.msg.users.passAtLeast8Char = 'Password must be at least 8 character';
config.msg.users.confirmPasswordMismatch = 'Password and confirm password mismatch';

config.msg.users.alreadyUse = 'already used';
config.msg.users.canNotBeEmpty = 'can not be empty';


module.exports = config;