import {axiosInstance} from "./index";

export const createNewDoc=async()=>{
    try{
        const response=await axiosInstance.post('/api/documents')
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const getUserDocs=async()=>{
    try{
        const response=await axiosInstance.get('/api/documents')
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const getAllDocs=async()=>{
    try{
        const response=await axiosInstance.get('/api/documents/all')
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const getDocById=async(id)=>{
    try{
        const response=await axiosInstance.get(`/api/documents/${id}`)
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const updateDocById=async(id,formData)=>{
    try{
        const response=await axiosInstance.put(`/api/documents/${id}`,formData)
        return response.data
    }catch(err){
        console.log(err)
    }
}
export const deleteDocById=async(id)=>{
    try{
        const response=await axiosInstance.delete(`/api/documents/${id}`)
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const generateShareableLinkById=async(id)=>{
    try{
        const response=await axiosInstance.post(`/api/documents/${id}/share`)
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const seekEditAccess=async(id)=>{
    try{
        const response=await axiosInstance.put(`/api/documents/${id}/seekEditAccess`)
        return response.data
    }catch(err){
        console.log(err)
    }
}

export const giveEditAccess=async(payload)=>{
    try{
        const response=await axiosInstance.put('/api/documents/giveEditAccess',payload)
        return response.data
    }catch(err){
        console.log(err)
    }
}