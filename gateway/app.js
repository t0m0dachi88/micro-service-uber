const express = require('express');
const app = express();
require('dotenv').config();
const proxy = require("express-http-proxy");

app.use("/user", proxy("http://localhost:3001"));

app.use("/captain", proxy("http://localhost:3002"));

app.listen(3000, () => {
    console.log("gate way Server is running on port 3000");
})