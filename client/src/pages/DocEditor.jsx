import React, { use, useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom'
import { getDocById, updateDocById } from '../services/doc';
import { FaRegSave } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // The default theme
import { useRef } from 'react';

function DocEditor() {
    const {documentId}=useParams();
    const screenHeight=window.innerHeight;
    const navigate=useNavigate();
    const [title,setTitle]=useState('');
    const [content,setContent]=useState('');
    const [isSaving,setIsSaving]=useState(false);
    const [isLoading,setIsLoading]=useState(false);
    const timerRef=useRef(null);


    const getDocumentData=async(id)=>{
        setIsLoading(true);
        try{
            const response =await getDocById(id);

            if(response && response.success){
                setTitle(prev=>response.data.title);
                setContent(prev=>response.data.content);
            }else
            {
                console.error('Failed to fetch document data');
            }
        }catch(err){
            console.error('Error fetching document data:', err);
        }finally{
          setIsLoading(false);
        }
    }

    const updateDocumentData=async()=>{
      setIsSaving(true);
        try{
            const formData={
                title,
                content
            }
            const response =await updateDocById(documentId,formData);

            if(response && response.success){
                console.log("doc is",response.data)
                setTitle(prev=>response.data.title);
                setContent(prev=>response.data.content);
            }else
            {
                console.error('Failed to update document data');
            }
        }catch(err){
            console.error('Error updating document data:', err);
        }finally{
          setIsSaving(false);
        }
    }

    const onClose=()=>{
      navigate("/");
    }

    useEffect(()=>{
        if(documentId){
            getDocumentData(documentId);
        }
    },[documentId]);

    useEffect(()=>{
      timerRef.current=setInterval(()=>{
        updateDocumentData();
      },30*1000);
      return ()=>{
        if(timerRef.current){
          clearInterval(timerRef.current);
        }
      }
    },[]);

    if(isLoading){
      return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Loading Document...</p>
            </div>
        );
    }
  
    return (
      <div className='min-h-screen flex items-center justify-center'
                style={{ width:'100%',
                    height:'100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(5px)',
                  }}>
          <div className='bg-white p-10 rounded-2xl shadow-md w-11/12 md:w-2/3 lg:w-1/2' style={{height:0.95*screenHeight}}>
              {/* --- 1. Top Bar / Controls --- */}
              <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                  
                  {/* Title Input */}
                  <div className="flex-grow min-w-0">
                      <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="text-xl font-bold text-gray-800 border-none focus:ring-0 w-full bg-transparent p-1 -m-1"
                          aria-label="Document Title"
                      />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex space-x-3 ml-4">
                      <div
                          onClick={updateDocumentData}
                          disabled={isSaving}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 
                              ${isSaving ? 'bg-red-400 cursor-not-allowed' : 'bg-red-900 hover:bg-red-600 text-white shadow-md'}`}
                      >
                          <FaRegTrashCan className="w-5 h-5 mr-2" />
                          {isSaving ? 'Deleting...' : 'Delete'}
                      </div>

                      <div
                          onClick={updateDocumentData}
                          disabled={isSaving}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 
                              ${isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-900 hover:bg-indigo-600 text-white shadow-md'}`}
                      >
                          <FaRegSave className="w-5 h-5 mr-2" />
                          {isSaving ? 'Saving...' : 'Save'}
                      </div>
                      
                      <div
                          onClick={onClose}
                          className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition duration-150"
                          title="Close Document"
                      >
                          <IoCloseCircleOutline className="w-6 h-6" />
                      </div>
                  </div>
              </header>

              <div className="min-w-full my-4 min-h-full">
                  <ReactQuill 
                      theme="snow"
                      value={content} 
                      onChange={(value) => {
                          setContent(value); 
                      }}
                      className="min-h-[60vh]"
                  />
              </div>
          </div>

    </div>
  )
}

export default DocEditor