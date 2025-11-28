import axios from 'axios'
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const axiosInstance=axios.create({
    headers:{
        "Content-Type":"application/json",
    },
    baseURL:'SERVER_URL'
})

axiosInstance.interceptors.request.use(function(config){
    const token=localStorage.getItem('token')
    if(token) config.headers.Authorization=`Bearer ${token}`
    return config
},
function(error){
    return Promise.reject(error)
})

export const socket=io(SERVER_URL,{
    transports:['polling','websocket'],
    auth:{
        token:localStorage.getItem('token')
    },
    autoConnect:true,
})

socket.on('connect',()=>{
    console.log('Socket connected:',socket.id);
});
socket.on('connect_error',(err)=>{
    console.error('Socket connection error:',err.message);
});



