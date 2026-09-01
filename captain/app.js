const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/db');
require('dotenv').config();
connectDB();
app.use(cors());
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());


const captainRoutes = require('./routes/captain.route');
app.use('/', captainRoutes);

module.exports = app;