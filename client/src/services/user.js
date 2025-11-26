import {axiosInstance} from "./index";

export const registerUser=async(formData)=>{
    try{
        const response=await axiosInstance.post('/api/auth/register',formData)
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const loginUser=async(formData)=>{
    try{
        const response=await axiosInstance.post('/api/auth/login',formData)
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const getCurrentUser=async()=>{
    try{
        console.log("client services")
        const response=await axiosInstance.get('/api/auth/me')
        return response.data
    }catch(err){
        console.log(err)
    }
}
