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


const userRoutes = require('./routes/user.route');
app.use('/', userRoutes);

module.exports = app;