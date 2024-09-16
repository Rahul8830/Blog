const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors) {
        const err = new Error("Validation Failed.");
        err.statusCode = 422;
        err.data = errors.array();
        throw err;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPass => {
            const user = new User({
                email: email,
                name: name,
                password: hashedPass
            })
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: "User created.", userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loggedUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error("E-mail does not exist.");
                error.statusCode = 422;
                throw error;
            }
            loggedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(result => {
            if (!result) {
                const error = new Error("Password does not match.");
                error.statusCode = 422;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: email,
                    userId: loggedUser._id.toString()
                }, 'supersecretsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({ token: token, userId: loggedUser._id.toString() })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}