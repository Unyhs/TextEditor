import {axiosInstance} from "./index";

export const grammarCheck=async(content)=>{
    try{
        const response=await axiosInstance.post('/api/ai/grammar-check',{content:content});
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const enhance=async(content)=>{
    try{
        const response=await axiosInstance.post('/api/ai/enhance',{content:content});
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const summarize=async(content)=>{
    try{
        const response=await axiosInstance.post('/api/ai/summarize',{content:content});
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const complete=async(content)=>{
    try{
        const response=await axiosInstance.post('/api/ai/complete',{content:content});
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const suggestions=async(content)=>{
    try{
        const response=await axiosInstance.post('/api/ai/suggestions',{content:content});
        return response.data
    }catch(err){
        console.log(err)
    }
}

