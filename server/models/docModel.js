const mongoose=require('mongoose')

const docSchema=new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Document title is required'],
        default: 'Untitled Document',
        trim: true
    },
    content: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },editors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: []
    }],seekers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: []
    }],
    shareToken: {
        type: String,
        unique: true,
        sparse: true
    }
},{
    timestamps: true
});

const docModel=mongoose.model("docs",docSchema)

module.exports=docModel;