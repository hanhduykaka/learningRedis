const express = require('express');
const router = express.Router();
const validator = require('./validator')
const user = require('./controller/user');

router.post('/user/add',validator.checkUser, user.postUser);
router.get('/user', user.getUsers);
router.route('/user/:id').get(user.getUserById)
     .put(validator.checkUser,user.putUser).delete(user.deleteUser);
 router.route('/api/v1/login').post(user.getToken);

module.exports = router;