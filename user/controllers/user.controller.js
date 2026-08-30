const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


async function register(req,res) {
    const {name,email,password} = req.body;
    try{
    const isUserExist = await userModel.findOne({email}); 
    if(isUserExist) {
        return res.status(400).json({message:"User already exist!"});
    } 
    const hash=await bcrypt.hash(password,10);
    const newUser=await userModel.create({name,email,password:hash});
    const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"1h"});
    res.cookie("token",token,{httpOnly:true});
    res.status(201).json({message:"User registered successfully!"});
}
catch(err){
    console.log(err);
    res.status(500).json({message:"Internal server error!"});
}  


}


async function login(req,res) {
    const {email,password} = req.body;
   const user = await userModel.findOne({email});
   if(!user) {
    return res.status(400).json({message:"User not found!"});
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if(!isMatch) {
    return res.status(400).json({message:"Invalid credentials!"});
   }
   const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
   res.cookie("token",token,{httpOnly:true});
   res.status(200).json({message:"User logged in successfully!"});
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
    const user = await userModel.findById(decodedToken.id);
    res.status(200).json({user});
}
module.exports = {register, login,profile};