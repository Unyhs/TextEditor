const userModel=require('../models/userModel')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const saltRounds=10

const registerNewUser=async(req,res)=>{
        const {name,email,password}=req.body;

        if(!name || !email || !password){
             return res.send({success:false,message:"Name, EMail and Password are required fields"})
        }

    try{
        const userExists=await userModel.findOne({email:email})
        if(userExists) return res.send({success:false,message:"Email already exists"})
        
        const hashedPW=await bcrypt.hash(password,saltRounds)
        const newUser=new userModel({name,email,password:hashedPW})
        await newUser.save()
        return res.send({success:true,message:`User with email ${newUser.email} is registered succesfully`})
    }catch(err){
        return res.status(400).json({message:err.message})
    }   
}

const loginUser=async(req,res)=>{

        const {email,password}=req.body;

        if(!email || !password){
             return res.send({success:false,message:"EMail and Password are required fields"})
        }
    try{
        const userExists=await userModel.findOne({email})
        if(!userExists) return res.send({success:false,message:"User not found. Please register."})

        const isMatch=await bcrypt.compare(password,userExists.password)
        if(!isMatch) return res.send({success:false,message:"Incorrect Password."})
        const token=jwt.sign({userId:userExists._id},process.env.jwt_secret,{expiresIn:'1d'})
        return res.send({success:true,message:`You have been logged in.`,data:token})
    }catch(err)
    {
        return res.status(400).json({message:err.message})
    }
}

const getCurrentUser=async(req,res)=>{
    const token=req.headers.authorization.split(" ")[1]
    const verifiedToken=jwt.verify(token,process.env.jwt_secret)

    try{
    const user=await userModel.findById(verifiedToken.userId).select("-password")
    res.send({success:true,data:user,message:"You are authorized"})
    }catch(err)
    {
        return res.status(400).json({message:err.message})
    }
}

module.exports={registerNewUser,loginUser,getCurrentUser}