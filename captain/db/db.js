const mongoose=require('mongoose');
require('dotenv').config();
async function connectDB()
{
   await mongoose.connect(process.env.DB_CONNECT)//halley is the namae of the database
  console.log("connected to database");

}

module.exports=connectDB;