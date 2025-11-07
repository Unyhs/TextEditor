const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    email:{type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true},
         password:{type:String,required:true},
        name:{type:String,required:true},
},{
    timestamps: true
});

const userModel=mongoose.model("users",userSchema)

module.exports=userModel;