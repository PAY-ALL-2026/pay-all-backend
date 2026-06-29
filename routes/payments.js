const express = require("express");
const router = express.Router();

const db = require("../database");
router.get("/payment-history", (req, res) => {

    db.all(
        `
        SELECT
            reference,
            list_name,
            recipients,
            total_amount,
            service_fee,
            total_paid,
            status,
            created_at
        FROM payment_history
        ORDER BY created_at DESC
        `,
        [],
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
router.post("/execute-payment", (req, res) => {

    const { list_id } = req.body;

    if (!list_id) {
        return res.json({
            message: "List ID is required"
        });
    }

    db.get(
        "SELECT list_name FROM lists WHERE id = ?",
        [list_id],
        (err, list) => {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            if (!list) {
                return res.json({
                    message: "List not found"
                });
            }

            db.all(
                "SELECT amount FROM list_items WHERE list_id = ?",
                [list_id],
                (err, rows) => {

                    if (err) {
                        return res.json({
                            message: "Database error"
                        });
                    }

                    if (rows.length === 0) {
                        return res.json({
                            message: "No recipients in this list"
                        });
                    }

                    const recipients = rows.length;

                    let total_amount = 0;

                    rows.forEach(item => {
                        total_amount += item.amount;
                    });

                    let service_fee = 0;

                    if (recipients <= 5)
                        service_fee = 500;
                    else if (recipients <= 15)
                        service_fee = 1000;
                    else if (recipients <= 30)
                        service_fee = 2000;
                    else if (recipients <= 100)
                        service_fee = 3500;
                    else
                        service_fee = 5000;

                    const total_paid = total_amount + service_fee;

                    const reference =
                        "PAY" + Date.now();

                    db.run(
                        `INSERT INTO payment_history
                        (
                            reference,
                            list_id,
                            list_name,
                            recipients,
                            total_amount,
                            service_fee,
                            total_paid,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            reference,
                            list_id,
                            list.list_name,
                            recipients,
                            total_amount,
                            service_fee,
                            total_paid,
                            "COMPLETED"
                        ],
                        function(err){

                            if(err){
                                return res.json({
                                    message:"Database error"
                                });
                            }

                            res.json({

                                message:"Batch payment completed",

                                reference,

                                list_name:list.list_name,

                                recipients,

                                total_amount,

                                service_fee,

                                total_paid,

                                status:"COMPLETED"

                            });

                        }
                    );

                }
            );

        }
    );

});
router.post("/preview-payment", (req, res) => {

    const { list_id } = req.body;

    if (!list_id) {
        return res.json({
            message: "List ID is required"
        });
    }

    db.all(
        "SELECT amount FROM list_items WHERE list_id = ?",
        [list_id],
        (err, rows) => {

            if (err) {
                return res.json({
                    message: "Database error"
                });
            }

            if (rows.length === 0) {
                return res.json({
                    message: "This list has no recipients"
                });
            }

            const recipients = rows.length;

            let total_amount = 0;

            rows.forEach(item => {
                total_amount += item.amount;
            });

            let service_fee = 0;

            if (recipients <= 5)
                service_fee = 500;
            else if (recipients <= 15)
                service_fee = 1000;
            else if (recipients <= 30)
                service_fee = 2000;
            else if (recipients <= 100)
                service_fee = 3500;
            else
                service_fee = 5000;

            db.get(
                "SELECT list_name FROM lists WHERE id = ?",
                [list_id],
                (err, list) => {

                    if (err) {
                        return res.json({
                            message: "Database error"
                        });
                    }

                    res.json({
                        list_name: list.list_name,
                        recipients,
                        total_amount,
                        service_fee,
                        total_to_pay: total_amount + service_fee
                    });

                }
            );

        }
    );

});
module.exports = router;