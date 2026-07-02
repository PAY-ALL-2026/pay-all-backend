const db = require("./database");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT UNIQUE,
            password TEXT,
            balance INTEGER DEFAULT 0
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS payment_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference TEXT,
            list_id INTEGER,
            list_name TEXT,
            recipients INTEGER,
            total_amount INTEGER,
            service_fee INTEGER,
            total_paid INTEGER,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_phone TEXT,
            list_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS list_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER,
            recipient_name TEXT,
            destination_identifier TEXT,
            amount INTEGER
        )
    `);

});
db.run(`
CREATE TABLE IF NOT EXISTS settings (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    fee_1_5 INTEGER,

    fee_6_15 INTEGER,

    fee_16_30 INTEGER,

    fee_31_100 INTEGER,

    fee_101_plus INTEGER

)
`);
db.get(
    "SELECT * FROM settings",
    [],
    (err, row) => {

        if (!row) {

            db.run(
                `
                INSERT INTO settings
                (
                    fee_1_5,
                    fee_6_15,
                    fee_16_30,
                    fee_31_100,
                    fee_101_plus
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    500,
                    1000,
                    2000,
                    3500,
                    5000
                ]
            );

        }

    }
);
db.get(
    "SELECT * FROM settings",
    [],
    (err, row) => {

        if (!row) {

            db.run(
                `
                INSERT INTO settings
                (
                    fee_1_5,
                    fee_6_15,
                    fee_16_30,
                    fee_31_100,
                    fee_101_plus
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    500,
                    1000,
                    2000,
                    3500,
                    5000
                ]
            );

        }

    }
);
module.exports = db;