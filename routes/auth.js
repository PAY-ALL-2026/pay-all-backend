const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const db = require("../database");
const RESPONSE = require("../helpers/constants");
const { sendSuccess, sendError } = require("../helpers/response");

/*
|--------------------------------------------------------------------------
| SIGNUP
|--------------------------------------------------------------------------
*/

router.post("/signup", (req, res) => {

    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
        return sendError(res, "Name, phone and password are required");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        "INSERT INTO users (name, phone, password) VALUES (?, ?, ?)",
        [name, phone, hashedPassword],
        function (err) {

            if (err) {
                return sendError(res, err.message);
            }

            return sendSuccess(
                res,
                RESPONSE.SIGNUP_SUCCESS,
                {
                    id: this.lastID,
                    name,
                    phone,
                    balance: 0
                }
            );

        }
    );

});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

router.post("/login", (req, res) => {

    const { phone, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE phone = ?",
        [phone],
        (err, user) => {

            if (err) {
                return sendError(res, RESPONSE.DATABASE_ERROR);
            }

            if (!user) {
                return sendError(res, RESPONSE.USER_NOT_FOUND);
            }

            const passwordMatch = bcrypt.compareSync(password, user.password);

            if (!passwordMatch) {
                return sendError(res, "Invalid phone or password");
            }

            return sendSuccess(
                res,
                RESPONSE.LOGIN_SUCCESS,
                user
            );

        }
    );

});

module.exports = router;