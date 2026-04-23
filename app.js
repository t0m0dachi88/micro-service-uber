const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./db/db');
require('dotenv').config();
connectDB();
app.use(cors());



module.exports = app;