import React, { use, useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom'
import { getDocById, updateDocById } from '../services/doc';
import { FaRegSave } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // The default theme
import { useRef } from 'react';
import { socket } from '../services/index';
import {useAuth} from '../hooks/AuthContext';
import {grammarCheck,enhance,summarize} from '../services/ai'

function DocEditor() {
    const {documentId}=useParams();
    const {user}=useAuth();
    const screenHeight=window.innerHeight;
    const navigate=useNavigate();
    const [title,setTitle]=useState('');
    const [content,setContent]=useState('');
    const [isSaving,setIsSaving]=useState(false);
    const [isLoading,setIsLoading]=useState(false);
    const [isAuthorizedToEdit,setIsAuthorizedToEdit]=useState(false);
    const [activeUsers,setActiveUsers]=useState([]);

    const [aiProcessing,setAiProcessing]=useState(false);
    const [showResult,setShowResult]=useState(false);
    const [aiResult,setAiResult]=useState("");

    const timerRef=useRef(null);
    const quillRef = useRef(null);
    const latestStateRef = useRef({ title: '', content: '' });

     useEffect(()=>{
        if(documentId){
            getDocumentData(documentId);
        }
    },[documentId]);

    useEffect(()=>{

        if(timerRef.current){
            clearInterval(timerRef.current);
        }

        if(isAuthorizedToEdit)
            {
                timerRef.current=setInterval(()=>{
                updateDocumentData();
            },30*1000);
        }
      
      return ()=>{
        if(timerRef.current){
          clearInterval(timerRef.current);
        }
      }
    },[isAuthorizedToEdit]);

    useEffect(() => {
        latestStateRef.current.title = title;
        latestStateRef.current.content = content;
    }, [title, content]);

    useEffect(() => {
        if (!documentId) return;
        
        socket.emit('join-document', documentId, (response) => {
            if (response.success) {
                setActiveUsers(response.activeUsers || []);
                console.log(`Joined room: ${response.docId}`);
            }
        });

        socket.on('text-change', (data) => {
            const editor = quillRef.current.getEditor();
            
            if (isAuthorizedToEdit && editor && data.delta) {
                editor.updateContents(data.delta);
            }
        });
        
        socket.on('user-joined', (data) => {
            console.log(`User ${data.userId} has joined.`);
            setActiveUsers(prev => {
            if (!prev.includes(data.userId)) {
                return [...prev, data.userId];
            }
            return prev;
            });
        });

        socket.on('user-left', (data) => {
            console.log(`User ${data.userId} has left.`);
            setActiveUsers(prev=>prev.filter(u=>u!==data.userId));
        });
        
        return () => {
            socket.off('text-change');
            socket.off('user-joined');
            socket.off('user-left');
            socket.emit('leave-document');
            setActiveUsers(prev=>prev.filter(u=>u!==user.userId));
        };
    }, [documentId, isAuthorizedToEdit]); 

    const getDocumentData=async(id)=>{
        setIsLoading(true);
        try{
            const response =await getDocById(id);

            if(response && response.success){
                setTitle(prev=>response.data.title);
                setContent(prev=>response.data.content);
                setIsAuthorizedToEdit(prev=>response.data.isAuthorizedToEdit);
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
                title:latestStateRef.current.title,
                content:latestStateRef.current.content,
            };
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

    const aiGrammarCheck=async()=>{
        setAiProcessing(true);
        try{
            const response=await grammarCheck(latestStateRef.current.content);
            if(response && response.success)
            {
                setAiResult(response.data)
                setShowResult(true);
            }else
            {
                console.log("error")
            }
        }catch(error)
        {
            console.log("Error encountered in grammar check",error)
        }finally
        {
            setAiProcessing(false);
        }
    }

    const aiEnhance=async()=>{
        setAiProcessing(true);
        try{
            const response=await enhance(latestStateRef.current.content);
            if(response && response.success)
            {
                setAiResult(response.data)
                setShowResult(true);
            }else
            {
                console.log("error")
            }
        }catch(error)
        {
            console.log("Error encountered in enhance",error)
        }finally
        {
            setAiProcessing(false);
        }
    }

    const aiSummarize=async()=>{
        setAiProcessing(true);
        try{
            const response=await summarize(latestStateRef.current.content);
            if(response && response.success)
            {
                setAiResult(response.data)
                setShowResult(true);
            }else
            {
                console.log("error")
            }
        }catch(error)
        {
            console.log("Error encountered in summarize",error)
        }finally
        {
            setAiProcessing(false);
        }
    }

    const onClose=()=>{
      navigate("/");
    }

    const handleResultClose=()=>{
        setAiProcessing(false);
        setShowResult(false);
        setAiResult("")
    }

    if(isLoading){
      return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Loading Document...</p>
            </div>
        );
    }

    if(aiProcessing)
    {
        return (
        <div className='min-h-screen flex items-center justify-center'
                style={{ width:'100%',
                    height:'100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(5px)',
                  }}>
          <div className='bg-white p-10 rounded-2xl shadow-md w-11/12 md:w-2/3 lg:w-1/2' style={{height:0.95*screenHeight}}>
                  <p className="text-lg text-gray-600">AI Processing....</p>
          </div>

    </div>
  )
    }
  
    return (
    <div className='min-h-screen flex items-center justify-center'
        style={{ width:'100%',
                height:'100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(5px)',
                }}>
          <div className='bg-white p-10 rounded-2xl shadow-md w-11/12 md:w-2/3 lg:w-1/2' style={{height:0.95*screenHeight}}>

              <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex-grow min-w-0">
                      <input
                          type="text"
                          value={title}
                          disabled={!isAuthorizedToEdit}
                          onChange={(e) => setTitle(e.target.value)}
                          className="text-xl font-bold text-gray-800 border-none focus:ring-0 w-full bg-transparent p-1 -m-1"
                          aria-label="Document Title"
                      />
                  </div>

                  <div className="flex space-x-3 ml-4">
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
                <div className="mb-2 p-2 rounded flex-col items-center">
                        <span className="text-indigo-800 font-bold">Check out our AI Tools</span>
                        <div className='flex items-center w-full justify-center gap-4 mt-4'>
                            <span
                            onClick={aiGrammarCheck}
                            className="text-white bg-indigo-600 font-bold
                                        hover:bg-white hover:text-indigo-600 hover:border-2 hover: border-indigo-600 hover:cursor-pointer
                                        px-4 py-1 rounded-full 
                                        shadow-lg 
                                        transition-all duration-300 
                                        flex items-center space-x-2 
                                        transform"
                            >
                            <span className="hidden sm:inline">Grammar Check</span>
                            </span>

                            <span
                                onClick={aiSummarize}
                                className="text-white bg-indigo-600 font-bold
                                        hover:bg-white hover:text-indigo-600 hover:border-2 hover: border-indigo-600 hover:cursor-pointer
                                        px-4 py-1 rounded-full 
                                        shadow-lg 
                                        transition-all duration-300 
                                        flex items-center space-x-2 
                                        transform"
                                >
                                <span className="hidden sm:inline">Summary</span>
                            </span>

                            <span
                            onClick={aiEnhance}
                                className="text-white bg-indigo-600 font-bold
                                        hover:bg-white hover:text-indigo-600 hover:border-2 hover: border-indigo-600 hover:cursor-pointer
                                        px-4 py-1 rounded-full 
                                        shadow-lg 
                                        transition-all duration-300 
                                        flex items-center space-x-2 
                                        transform"
                                >
                                <span className="hidden sm:inline">Enhance</span>
                            </span>
                        </div>
                </div>
                {showResult && 
                <div className='bg-gray-100 flex-col items-start p-4 relative'>
                    <div className='justify-self-start'>
                        Results:
                    </div>
                    <div className='justify-self-start bg-white mb-4 w-full rounded-xl p-2 text-justify'>
                        {aiResult}
                    </div>
                    <div
                          onClick={handleResultClose}
                          className="p-2 absolute top-1 right-2 text-gray-500 hover:bg-gray-200 rounded-full transition duration-150"
                          title="Close Result"
                      >
                          <IoCloseCircleOutline className="w-6 h-6" />
                      </div>
                </div>}
                <ReactQuill 
                    theme="snow"
                    ref={quillRef}
                    value={content} 
                    readOnly={!isAuthorizedToEdit}
                    onChange={(value,delta,source) => {
                        setContent(value); 

                        if(source === 'user' && isAuthorizedToEdit){
                            socket.emit('text-change', delta);
                        }

                    }}
                    className="mb-4"
                />

                <div className="min-w-full my-4">
                {activeUsers.length > 0 && (
                    <div className="mb-2 p-2 bg-blue-100 rounded">
                        <span className="text-sm text-blue-800 font-medium">Active Users: </span>
                        {activeUsers.map((userName, index) => (
                            <span key={index} className="text-sm text-blue-700 mr-2">{userName}</span>
                        ))}
                    </div>
                )}
                {activeUsers.length === 0 && (
                    <div className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="text-sm text-gray-600 font-medium">No active users currently.</p>
                    </div>
                )}
                </div>
              </div>
          </div>

    </div>
  )
}

export default DocEditor