import {useEffect, useState,useRef } from 'react'
import { useParams,useNavigate } from 'react-router-dom'
import { getDocById, giveEditAccess, seekEditAccess, updateDocById } from '../services/doc';
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaEye,FaCheck,FaRegSave } from "react-icons/fa";
import TipTapEditor from './TipTapEditor';
import AICheck from '../components/AICheck';
import { BsPencilSquare } from 'react-icons/bs';
import { MdManageAccounts } from "react-icons/md";
import { useAuth } from '../hooks/AuthContext';

function DocEditorTipTap() {
    const {documentId}=useParams();
    const {user}=useAuth();
    const screenHeight=window.innerHeight;
    const navigate=useNavigate();
    const [title,setTitle]=useState('');
    const [content,setContent]=useState('');
    const [isSaving,setIsSaving]=useState(false);
    const [isLoading,setIsLoading]=useState(false);
    const [isAuthorizedToEdit,setIsAuthorizedToEdit]=useState(false);
    const [isAccPerDisabled,setIsAccPerDisabled]=useState(false)
    const [isOwner,setIsOwner]=useState(false);
    const [activeUsers,setActiveUsers]=useState([]);
    const [aiProcessing,setAiProcessing]=useState(false);
    const [showResult,setShowResult]=useState(false);
    const [aiResult,setAiResult]=useState("");
    const [docSeekers,setDocSeekers]=useState([]);

    const timerRef=useRef(null);
    const cursorsRef = useRef(new Map());
    const latestStateRef = useRef({ title: '', content: '' });

     useEffect(()=>{

        if(!user){
            return;
        }
        
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

    const getDocumentData=async(id)=>{
        setIsLoading(true);
        try{
            const response =await getDocById(id);

            if(response && response.success){
                setTitle(response.data.title);
                setContent(response.data.content);
                setIsAuthorizedToEdit(response.data.isAuthorizedToEdit);
                setIsOwner(response.data.isOwner)
                console.log(response.data.docSeekers)
                console.log(user)
                const userExists = response.data.docSeekers.some(seeker => seeker.id === user._id);

                if(userExists) {
                    setIsAccPerDisabled(true);
                }

                if(response.data.isOwner && response.data.docSeekers) 
                {
                    setDocSeekers(response.data.docSeekers)
                }
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
                setTitle(response.data.title);
                setContent(response.data.content);
                setIsAuthorizedToEdit(response.data.isAuthorizedToEdit);
                setIsOwner(response.data.isOwner)
                const userExists = response.data.docSeekers.some(seeker => seeker.id === user._id);

                if(userExists) {
                    setIsAccPerDisabled(true);
                }

                if(response.data.isOwner && response.data.docSeekers) 
                {
                    setDocSeekers(response.data.docSeekers)
                    
                }
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

    const handleResultClose=()=>{
        setAiProcessing(false);
        setShowResult(false);
        setAiResult("")
    }

    const handleSeekEditAccess=async()=>{

        if(isAccPerDisabled) {
                alert("You have already requested edit access. Please wait for the document owner to respond.")
                return;
        }

        try{
            const response =await seekEditAccess(documentId);
            if(response && response.success){
                setIsAccPerDisabled(true)
            }else{
                console.error('Failed to seek access');
            }
        }catch(err){
            console.error('Error seeking access:', err);
        }
    }

    const handleGiveEditAccess=async(seekerId)=>{
        try{
            const payload={id:documentId,seekerId:seekerId}
            const response =await giveEditAccess(payload);
            if(response && response.success){
                updateDocumentData();
            }else{
                console.error('Failed to give access');
            }
        }catch(err){
            console.error('Error giving access:', err);
        }
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
                  <div className="flex justify-center items-center h-screen">
                    <p className="text-lg text-gray-600">AI Processing...</p>
                </div>
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
          <div className='bg-white p-2 md:p-10 rounded-2xl shadow-md w-11/12 md:w-2/3 lg:w-1/2' style={{height:0.95*screenHeight}}>

              <header className="flex items-center justify-between p-1 md:p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex-grow min-w-0">
                      <input
                          type="text"
                          value={title}
                          disabled={!isAuthorizedToEdit}
                          onChange={(e) => setTitle(e.target.value)}
                          className="text-xl font-bold text-gray-800 border-none focus:ring-0 w-full bg-transparent p-1 m-1"
                          aria-label="Document Title"
                      />
                  </div>

                  <div className="flex space-x-1 md:space-x-3 ml-4">
                    <div
                        onClick={updateDocumentData}
                        disabled={isSaving}
                        className={`hidden md:flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 
                            ${isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-900 hover:bg-green-600 hover:cursor-pointer text-white shadow-md'}`}
                    >
                        <FaRegSave className="w-5 h-5 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </div>

                    <div
                        onClick={updateDocumentData}
                        disabled={isSaving}
                        className={`flex md:hidden items-center
                            ${isSaving ? 'cursor-not-allowed' : 'hover:cursor-pointer'}`}
                    >
                        {isSaving ? <FaRegSave color={'red'} className="w-5 h-5 mr-2" /> : <FaRegSave color={'green'} className="w-5 h-5 mr-2" />}
                    </div>

                    {isOwner && <div
                        onClick={()=>{alert("Manage permissions clicked")}}
                        className='hidden md:flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 
                             bg-indigo-900 hover:bg-indigo-600 hover:cursor-pointer text-white shadow-md'
                    >
                        <MdManageAccounts className="w-5 h-5 mr-2" />
                        Manage Permissions
                    </div>}

                    {isOwner && <div
                        onClick={()=>{alert("Manage permissions clicked")}}
                        className='flex md:hidden items-center
                            hover:cursor-pointer'
                    >
                        <MdManageAccounts color={'indigo'} className="w-5 h-5 mr-2" />
                    </div>}
 
                    

                    {!isAuthorizedToEdit &&
                        <>
                            <div 
                            onClick={handleSeekEditAccess} 
                            disabled={isAccPerDisabled}
                            className={`hidden md:flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 
                                        bg-white md:bg-orange-900 text-white shadow-md ${isAccPerDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-orange-700'}`}>
                                <BsPencilSquare  className="w-5 h-5 mr-2" /> 
                                <span>
                                    {isAccPerDisabled? 'Requested':'Edit'}
                                </span>
                            </div>

                            <div
                            onClick={handleSeekEditAccess}
                            disabled={isAccPerDisabled}
                            className={`flex md:hidden items-center
                                ${isAccPerDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <BsPencilSquare color={isAccPerDisabled? 'grey':'orange'} className="w-5 h-5" /> 
                            </div>
                        </>
                    }
                    
                    <div
                        onClick={onClose}
                        className="p-1 md:p-2 text-gray-500 hover:bg-gray-200 rounded-full transition duration-150"
                        title="Close Document"
                    >
                        <IoCloseCircleOutline className="w-6 h-6" />
                    </div>
                  </div>
              </header>

              <div className="min-w-full my-4 min-h-full">
                <AICheck setAiProcessing={setAiProcessing} setShowResult={setShowResult} setAiResult={setAiResult} latestStateRef={latestStateRef}/>

                {showResult && 
                <div className='bg-indigo-100 flex-col items-start p-4 relative'>
                    <div className='justify-self-start'>
                        Results:
                    </div>
                    {aiResult ?
                    <div className='justify-self-start bg-white mb-4 w-full rounded-xl p-2 text-justify'>
                        {aiResult}
                    </div> : 
                    <div className='justify-self-start bg-white mb-4 w-full rounded-xl p-2 text-justify'>
                        Error fetching AI results. Please try again.
                    </div>}
                    <div
                          onClick={handleResultClose}
                          className="p-2 absolute top-1 right-2 text-gray-500 hover:bg-gray-200 rounded-full transition duration-150"
                          title="Close Result"
                      >
                          <IoCloseCircleOutline className="w-6 h-6" />
                      </div>
                </div>}

                <TipTapEditor content={content} setContent={setContent} 
                isAuthorizedToEdit={isAuthorizedToEdit} documentId={documentId} 
                setActiveUsers={setActiveUsers} cursorsRef={cursorsRef} />

                {/* {isOwner && docSeekers && docSeekers.length>0 &&
                <div>
                    <span className='font-bold text-indigo-900'>
                        Manage Permissions
                    </span>
                    
                    {docSeekers && docSeekers.length>0 && <div className='flex gap-4 mt-1 py-4'>
                        {docSeekers.map((seeker)=>
                        (<div key={seeker.id} className='flex justify-between p-4 border-1 border-gray-400 rounded-xl gap-4 '>
                            <span>{seeker.name}</span>
                            <div onClick={()=>{ handleGiveEditAccess(seeker.id)}} 
                            className='bg-green-900 rounded-3xl p-2 flex items-center justify-center hover:cursor-pointer'>
                                <FaCheck className="w-4 h-4 mr-2 text-white" />
                            </div>

                            <div onClick={()=>{ handleGiveEditAccess(seeker.id)}} 
                            className='bg-green-900 rounded-3xl p-2 flex items-center justify-center hover:cursor-pointer'>
                                <FaCheck className="w-4 h-4 mr-2 text-white" />
                            </div>

                            <div onClick={()=>{ handleGiveEditAccess(seeker.id)}} 
                            className='bg-green-900 rounded-3xl p-2 flex items-center justify-center hover:cursor-pointer'>
                                <FaCheck className="w-4 h-4 mr-2 text-white" />
                            </div>
                        </div>))}
                    </div>
                    }
                </div>
                } */}

              </div>
          </div>

    </div>
  )
}

export default DocEditorTipTap