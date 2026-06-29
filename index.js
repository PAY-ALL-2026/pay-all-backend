const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const paymentRoutes = require("./routes/payments");
const db = require("./setupDatabase");

const authRoutes = require("./routes/auth");
const listRoutes = require("./routes/lists");
app.use(paymentRoutes);
app.use(express.json());

app.use(authRoutes);
app.use(listRoutes);

app.get("/", (req, res) => {
    res.send("Pay All Backend is running");
});









    







 

const PORT = 3000;

app.listen(PORT, () => {
    console.log("server is running on port " +
PORT);
});