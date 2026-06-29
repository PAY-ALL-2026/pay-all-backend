const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const db = require("../database");

router.post("/signup", (req, res) => {

    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
        return res.json({
            message: "Name, phone and password are required"
        });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        "INSERT INTO users (name, phone, password) VALUES (?, ?, ?)",
        [name, phone, hashedPassword],
        function (err) {

            if (err) {
                return res.json({
                    message: err.message
                });
            }

            res.json({
                message: "User created successfully",
                id: this.lastID,
                name,
                phone,
                balance: 0
            });

        }
    );

});
router.post("/login", (req, res) => {

    const { phone, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE phone = ?",
        [phone],
        (err, user) => {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            if (!user) {
                return res.json({
                    message: "User not found"
                });
            }

            const passwordMatch = bcrypt.compareSync(password, user.password);

            if (!passwordMatch) {
                return res.json({
                    message: "Invalid phone or password"
                });
            }

            res.json({
                message: "Login successful",
                user
            });

        }
    );

});
module.exports = router;