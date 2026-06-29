const express = require("express");
const router = express.Router();

const db = require("../database");

/*
|--------------------------------------------------------------------------
| CREATE LIST
|--------------------------------------------------------------------------
*/

router.post("/create-list", (req, res) => {

    const { phone, list_name } = req.body;

    if (!phone || !list_name) {
        return res.json({
            message: "Phone and list name are required"
        });
    }

    db.run(
        "INSERT INTO lists (user_phone, list_name) VALUES (?, ?)",
        [phone, list_name],
        function (err) {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            res.json({
                message: "List created successfully",
                list_id: this.lastID,
                list_name
            });

        }
    );

});

/*
|--------------------------------------------------------------------------
| ADD RECIPIENT
|--------------------------------------------------------------------------
*/

router.post("/add-recipient", (req, res) => {

    const {
        list_id,
        recipient_name,
        destination_identifier,
        amount
    } = req.body;

    if (!list_id) {
        return res.json({
            message: "List ID is required"
        });
    }

    if (!recipient_name || recipient_name.trim().length < 2) {
        return res.json({
            message: "Recipient name is too short"
        });
    }

    if (!destination_identifier || destination_identifier.trim() === "") {
        return res.json({
            message: "Destination identifier is required"
        });
    }

    if (!amount || amount <= 0) {
        return res.json({
            message: "Amount must be greater than zero"
        });
    }

    db.get(
        `SELECT id
         FROM list_items
         WHERE list_id = ?
         AND destination_identifier = ?`,
        [list_id, destination_identifier],
        (err, existing) => {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            if (existing) {
                return res.json({
                    message: "This destination identifier already exists in the list"
                });
            }

            db.run(
                `INSERT INTO list_items
                (list_id, recipient_name, destination_identifier, amount)
                VALUES (?, ?, ?, ?)`,
                [
                    list_id,
                    recipient_name,
                    destination_identifier,
                    amount
                ],
                function (err) {

                    if (err) {
                        return res.json({
                            message: "Database error"
                        });
                    }

                    res.json({
                        message: "Recipient added successfully",
                        recipient_id: this.lastID
                    });

                }
            );

        }
    );

});
/*
|--------------------------------------------------------------------------
| LIST ITEMS
|--------------------------------------------------------------------------
*/

router.get("/list-items", (req, res) => {

    const { list_id } = req.query;

    if (!list_id) {
        return res.json({
            message: "List ID is required"
        });
    }

    db.all(
        `SELECT *
         FROM list_items
         WHERE list_id = ?`,
        [list_id],
        (err, rows) => {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            res.json(rows);

        }
    );

});
/*
|--------------------------------------------------------------------------
| RENAME LIST
|--------------------------------------------------------------------------
*/

router.put("/rename-list", (req, res) => {

    const { list_id, list_name } = req.body;

    if (!list_id) {
        return res.json({
            message: "List ID is required"
        });
    }

    if (!list_name || list_name.trim().length < 2) {
        return res.json({
            message: "List name is too short"
        });
    }

    db.run(
        "UPDATE lists SET list_name = ? WHERE id = ?",
        [list_name, list_id],
        function(err){

            if(err){
                return res.json({
                    message:"Database error"
                });
            }

            if(this.changes === 0){
                return res.json({
                    message:"List not found"
                });
            }

            res.json({
                message:"List renamed successfully"
            });

        }
    );

});
router.delete("/delete-list", (req, res) => {

    const { list_id } = req.body;

    if (!list_id) {
        return res.json({
            message: "List ID is required"
        });
    }

    db.run(
        "DELETE FROM list_items WHERE list_id = ?",
        [list_id],
        function (err) {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            db.run(
                "DELETE FROM lists WHERE id = ?",
                [list_id],
                function (err) {

                    if (err) {
                        return res.json({
                            message: "Database error"
                        });
                    }

                    if (this.changes === 0) {
                        return res.json({
                            message: "List not found"
                        });
                    }

                    res.json({
                        message: "List deleted successfully"
                    });

                }
            );

        }
    );

});
router.put("/edit-recipient", (req, res) => {

    const {
        recipient_id,
        recipient_name,
        destination_identifier,
        amount
    } = req.body;

    if (
        !recipient_id ||
        !recipient_name ||
        !destination_identifier ||
        !amount
    ) {
        return res.json({
            message: "Missing required fields"
        });
    }

    db.run(
        `
        UPDATE list_items
        SET
            recipient_name = ?,
            destination_identifier = ?,
            amount = ?
        WHERE id = ?
        `,
        [
            recipient_name,
            destination_identifier || "",
            amount,
            recipient_id
        ],
        function (err) {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            if (this.changes === 0) {
                return res.json({
                    message: "Recipient not found"
                });
            }

            res.json({
                message: "Recipient updated successfully"
            });

        }
    );

});
router.get("/my-lists", (req, res) => {

    const { phone } = req.query;

    if (!phone) {
        return res.json({
            message: "Phone is required"
        });
    }

    db.all(
        `
        SELECT
            id,
            list_name,
            created_at
        FROM lists
        WHERE user_phone = ?
        ORDER BY created_at DESC
        `,
        [phone],
        (err, rows) => {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            res.json(rows);

        }
    );

});
module.exports = router;