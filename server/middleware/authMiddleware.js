const jwt=require('jsonwebtoken')

const authMiddleware=(req,res,next)=>{
    try{
    const token=req.headers.authorization.split(" ")[1]
    const verifiedToken=jwt.verify(token,process.env.jwt_secret)
    console.log("verified token", verifiedToken.userId)
    req.body.userId=verifiedToken.userId
    console.log("sending next")
    next()
    }catch(err)
    {
        console.log("catch middleware")
        res.status(401).send({success:false,message:"Invalid Token"})
    }
}

module.exports=authMiddleware