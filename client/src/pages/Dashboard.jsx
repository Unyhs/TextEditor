import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.jsx'; // To get the user's name
import DocumentCard from '../components/DocumentCard.jsx'; // A component you will create later
import { IoMdAddCircle } from "react-icons/io";
import {createNewDoc,getUserDocs} from '../services/doc.js';
import { IoMdLogOut } from "react-icons/io";
import { FaUser } from "react-icons/fa";


function Dashboard() {
    const { user,logoutUser } = useAuth();
    const navigate = useNavigate();
    const userName = user?.name || 'User'; // Safely get the display name
    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState([]);

    const handleCreateNewDocument = async() => {
   
        try{
            const response=await createNewDoc();
            if(response && response.success){
                const newDocumentId=response.data;
                navigate(`/document/${newDocumentId}`);
            }else{
                console.log("Failed to create new document");
            }
        }catch(err){
            console.log("Error creating new document:", err)
        }
    };

    const fetchAllUserDocuments = async () => {
        setIsLoading(true);
        try{
            const response = await getUserDocs();

            if(response && response.success){
                setDocuments(response.data);
            }else{
                console.log("Failed to fetch documents");
            }
        }catch(error){
            console.log("error",error);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAllUserDocuments();
    }, []);

    if(isLoading){
        return (
            <div className="flex items-center justify-center min-h-screen"> 
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32">Loading...</div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center p-2">

            <div className='w-full bg-indigo-600 flex justify-end items-center gap-4'>
                        <div className="flex items-center space-x-4 p-4">
                            <FaUser className="w-4 h-4 mr-2 text-white" /> 
                            <p className="text-xl text-white">
                                {userName}
                            </p>
                        </div>

                            {/* 3. Floating Action Button (FAB) */}
                        <div
                            onClick={logoutUser}
                            className="text-white text-xl
                                    bg-indigo-600 mr-16
                                    flex items-center space-x-2
                                    hover:cursor-pointer"
                            title="Logout"
                        >
                            <IoMdLogOut />
                            <span className="hidden sm:inline">Logout</span>
                        </div>
                  
            </div>
            
            {/* 2. My Document Grid Layout */}
            <main className='w-11/12'>
                <div className='w-full md:w-1/2 lg:w-1/4 xl:w-1/6 mb-6'>
                   <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        My Documents
                    </h2>
                </div>
                
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {documents.map(doc => (
                        <DocumentCard 
                            key={doc._id} 
                            document={doc} 
                            onClick={() => navigate(`/document/${doc._id}`)}
                        />
                    ))}
                </div>
                
                {documents.length === 0 && (
                    <div className="text-center p-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg mt-8">
                        No documents found. Click the button below to create your first!
                    </div>
                )}
            </main>

            {/* 3. Floating Action Button (FAB) */}
            <div
                onClick={handleCreateNewDocument}
                className="fixed bottom-8 right-8 text-white
                           bg-indigo-600 hover:bg-indigo-700 
                           p-4 rounded-full 
                           shadow-lg 
                           transition-all duration-300 
                           flex items-center space-x-2 
                           transform hover:scale-105"
                title="Create New Document"
            >
                <IoMdAddCircle />
                <span className="hidden sm:inline">New Document</span>
            </div>

            {/* <div className='w-full md:w-1/2 lg:w-1/4 xl:w-1/6 mb-6 mt-24'>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    Explore
                </h2>
            </div> */}

        </div>
    );
}

export default Dashboard