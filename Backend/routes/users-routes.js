const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

router.get('/', usersController.getUsers);

router.post('/signup', 
    fileUpload.single('image'),
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 8 })
    ],
    usersController.signup);

router.post('/login', usersController.login);

module.exports = router;