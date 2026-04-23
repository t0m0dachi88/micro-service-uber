const mongoose=require('mongoose');

async function connectDB()
{
   await mongoose.connect("mongodb://irfan:noorejannat@ac-63qoga5-shard-00-00.oakenxg.mongodb.net:27017,ac-63qoga5-shard-00-01.oakenxg.mongodb.net:27017,ac-63qoga5-shard-00-02.oakenxg.mongodb.net:27017/uber-clone?ssl=true&replicaSet=atlas-s2do6s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=yt-backend")//halley is the namae of the database
  console.log("connected to database");

}

module.exports=connectDB;