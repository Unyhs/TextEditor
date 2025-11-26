const express=require('express')
const app=express()
const cors=require('cors')

const { Server: SocketIOServer } = require('socket.io'); 
const initializeSocket = require('./services/socketServices');

const {createServer}=require('http')
const httpServer=createServer(app)

//entity routers
const userRouter=require("./routes/userRoutes")
const docRouter=require("./routes/docRoutes")
const aiRouter=require("./routes/aiRoutes")


//DB Connection
//commnented out for AWS testing
//require ('dotenv').config()
const connectDB=require("./config/db")
connectDB();

const clientUrl=process.env.CLIENT_URL

//middlewares
app.use(express.json())
app.use(cors({
    origin:clientUrl,
    methods:['GET','POST','PUT','PATCH','DELETE'],
    allowedHeaders:['Content-Type','Authorization'],
    credentials:true,
})) 

const io = new SocketIOServer(httpServer, {
    cors: {
        origin:clientUrl,
        methods: ['GET', 'POST'],
        credentials:true,
    }
});

initializeSocket(io);

//all calls for entities will go through here
app.use("/api/auth",userRouter)
app.use("/api/documents",docRouter)
app.use("/api/ai",aiRouter)

//listening to requests
const serverPort=8082
httpServer.listen(serverPort,'0.0.0.0',()=>{
    console.log(`Server is running at port 0.0.0.0 ${serverPort}`)
})

