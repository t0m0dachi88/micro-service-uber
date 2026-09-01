const captainModel = require("../models/captain.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


async function register(req,res) {
    const {name,email,password} = req.body;
    try{
    const iscaptainExist = await captainModel.findOne({email}); 
    if(iscaptainExist) {
        return res.status(400).json({message:"captain already exist!"});
    } 
    const hash=await bcrypt.hash(password,10);
    const newcaptain=await captainModel.create({name,email,password:hash});
    const token=jwt.sign({id:newcaptain._id},process.env.JWT_SECRET,{expiresIn:"1h"});
    res.cookie("token",token,{httpOnly:true});
    res.status(201).json({message:"captain registered successfully!"});
}
catch(err){
    console.log(err);
    res.status(500).json({message:"Internal server error!"});
}  


}


async function login(req,res) {
    const {email,password} = req.body;
   const captain = await captainModel.findOne({email});
   if(!captain) {
    return res.status(400).json({message:"captain not found!"});
   }
   const isMatch = await bcrypt.compare(password, captain.password);
   if(!isMatch) {
    return res.status(400).json({message:"Invalid credentials!"});
   }
   const token=jwt.sign({id:captain._id},process.env.JWT_SECRET,{expiresIn:"1h"});
   res.cookie("token",token,{httpOnly:true});
   res.status(200).json({message:"captain logged in successfully!"});
}


async function profile(req,res) {
 const token = req.cookies.token;
 if(!token) {
    return res.status(401).json({message:"Unauthorized!"});
 }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    if(!decodedToken) {
        return res.status(400).json({message:"Invalid token!"});
    }
    const captain = await captainModel.findById(decodedToken.id);
    res.status(200).json({captain});
}
module.exports = {register, login,profile};