const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controller/auth");
const User = require("../models/user");

router.put("/signup", [
    body("email").isEmail().withMessage("Invalid E-mail.")
        .custom(value => {
            return User.findOne({ email: value }).then(user => {
                if (user) {
                    return Promise.reject("E-mail already exists.")
                }
            })
        })
        .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim()
], authController.signup);

router.post('/login',authController.login);

module.exports = router;