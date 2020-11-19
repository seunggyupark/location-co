const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch(err) {
        return next(new HttpError('Could not retrieve users, please try again later.', 500));
    };
    res.json({users: users.map(user => user.toObject({ getters: true }))});
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne( { email: email });
    } catch(err) {
        return next(new HttpError('Login failed, please try again later.', 500));
    };

    if (!existingUser) next(new HttpError(`Credentials seem to be incorrect. Please try again.`, 403));

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch(err) {
        return next(new HttpError('Login failed, please try again later.', 500));
    };

    if (!isValidPassword) next(new HttpError(`Credentials seem to be incorrect. Please try again.`, 403));

    let token;
    try {
        token = jwt.sign({userId: existingUser.id, email: existingUser.email}, process.env.JWT_KEY, {expiresIn: '1h'})
    } catch(err) {
        return next(new HttpError('Login failed, please try again later.', 500));
    };

    return res.status(200).json({userId: existingUser.id, email: existingUser.email, token});
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) next(new HttpError('Invalid inputs passed, please check your data.', 422));

    const { username, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne( { email: email });
    } catch(err) {
        return next(new HttpError('Sign up failed, please try again later.', 500));
    };

    if (existingUser) next(new HttpError('That email is already used, please login instead.', 500));

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch(err) {
        return next(new HttpError('Sign up failed, please try again later.', 500));
    };

    const createdUser = await new User({ 
        username, 
        email, 
        password: hashedPassword, 
        image: req.file.path,
        locations: []
    });

    try {
        await createdUser.save();
    } catch(err) {
        return next(new HttpError('Sign up failed, please try again later.', 500));
    };

    let token;
    try {
        token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.JWT_KEY, {expiresIn: '1h'})
    } catch(err) {
        return next(new HttpError('Sign up failed, please try again later.', 500));
    };

    res.status(201).json({ user: createdUser.id, email: createdUser.email, token });
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;