import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { BsPencilSquare } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import {formatSimpleDateTime} from '../utils/helper.js';

function DocumentCard({ document }) {
    const navigate = useNavigate();

    // Determine the color/icon based on permission
    const permissionMap = {
        owner: { icon: FaUser, color: 'text-indigo-600', label: 'Owner' },
        editor: { icon: BsPencilSquare, color: 'text-green-600', label: 'Can Edit' },
        viewer: { icon: FaEye, color: 'text-gray-500', label: 'Can View' },
    };
    
    const permission = permissionMap[document.userPermission] || permissionMap.viewer;

    // Custom class for the A4 aspect ratio (1:1.414, or 141.4% height of width)
    const cardAspectRatioClass = 'w-full pb-[141.4%] relative'; 

    const handleCardClick = () => {
        navigate(`/document/${document._id}`);
    };

    return (
        <>
        {/* ================= MOBILE ROW VIEW ================= */}
        <div
            onClick={handleCardClick}
            className="sm:hidden bg-white border border-gray-200 rounded-lg pt-4
                    shadow-sm hover:bg-gray-50 cursor-pointer relative mb-4"
        >
            <div className="flex items-center ml-4 shrink-0 absolute top-4 right-4">
                <permission.icon className={`w-4 h-4 mr-1 ${permission.color}`} />
            </div>
            <div className='flex flex-col p-2'>
                <p className="font-semibold text-gray-900 truncate">
                    {document.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                    Owner: {document.ownerName}
                </p>
            </div>
            <div className="px-4 pb-3 pt-1 border-t border-gray-50 text-xs text-gray-400">
                Last Modified: {formatSimpleDateTime(document.lastModified)} 
            </div>
        </div>

        {/* ================= DESKTOP CARD VIEW ================= */}        
        <div className="hidden sm:block w-full max-w-xs transition-transform hover:scale-[1.02] duration-300">
            <div className={cardAspectRatioClass}>
                <div 
                    className="absolute inset-0 bg-white rounded-xl shadow-lg 
                               overflow-hidden flex flex-col hover:cursor-pointer border border-gray-100"
                    onClick={handleCardClick}
                >
                    <div className="flex-grow p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">Document Preview Area</p>
                        {/*  */}

                        {/* User Permission */}
                            <div className="flex items-center absolute top-2 right-4">
                                <permission.icon className={`w-4 h-4 mr-2 ${permission.color}`} />
                                <span className={`text-xs font-semibold ${permission.color}`}>
                                    {permission.label}
                                </span>
                            </div>
                    </div>

                    {/* 2. Metadata Footer */}
                    <div className="p-4 flex flex-col justify-between flex-shrink-0">
                        
                        {/* Title (Primary Info) */}
                        <p className="text-gray-900 font-extrabold text-lg leading-tight mb-2 truncate">
                            {document.title}
                        </p>

                        {/* Owner and Permission */}
                        <div className="text-sm space-y-1">
                            
                            {/* Owner */}
                            <div className="flex items-center text-gray-600">
                                <FaUser className="w-4 h-4 mr-2" />
                                <span className="font-medium truncate">Owner: {document.ownerName}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 3. Timestamp */}
                    <div className="px-4 pb-3 pt-1 border-t border-gray-50 text-xs text-gray-400">
                        Last Modified: {formatSimpleDateTime(document.lastModified)} 
                    </div>

                </div>
            </div>
        </div>
        </>
        
    );
}

export default DocumentCard;