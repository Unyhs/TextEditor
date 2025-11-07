const express=require('express')
const userRouter=express.Router()
const authMiddleWare=require('../middleware/authMiddleware')
const {registerNewUser, loginUser, getCurrentUser}=require('../services/userServices')

userRouter.post("/register",registerNewUser)
userRouter.post("/login",loginUser)
userRouter.get('/me',getCurrentUser)

module.exports=userRouter