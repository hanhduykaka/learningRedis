const express = require('express');
const router = express.Router();
const validator = require('./validator')
const user = require('./controller/user');
const config = require('./config');

router.post(config.url.users.add,validator.checkUser, user.postUser);
router.get(config.url.users.getAll, user.getUsers);
router.route(config.url.users.byId).get(user.getUserById)
     .put(validator.checkUser,user.putUser).delete(user.deleteUser);
 router.route(config.url.login).post(user.getToken);

module.exports = router;