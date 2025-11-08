const express=require('express')
const app=express()
const cors=require('cors')

const { Server: SocketIOServer } = require('socket.io'); 
const initializeSocket = require('./services/socketServices');

const {createServer}=require('http')
const httpServer=createServer(app)

//DB Connection
require ('dotenv').config()
const connectDB=require("./config/db")
connectDB();

//middlewares
app.use(express.json())
app.use(cors({
    origin:'*',
    methods:['GET','POST','PUT','PATCH','DELETE'],
    allowedHeaders:['Content-Type','Authorization'],
})) 

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

initializeSocket(io);

//entity routers
const userRouter=require("./routes/userRoutes")
const docRouter=require("./routes/docRoutes")

//all calls for entities will go through here
app.use("/api/auth",userRouter)
app.use("/api/documents",docRouter)

//listening to requests
const serverPort=8082
httpServer.listen(serverPort,()=>{
    console.log(`Server is running at port ${serverPort}`)
})

