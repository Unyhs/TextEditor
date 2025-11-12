const docModel =require('../models/docModel.js');
const userModel=require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const documentUsers = {};
const userNameCache = {};

const getDisplayName = async (userId) => {
    if (userNameCache[userId]) {
        return userNameCache[userId];
    }
    
    try {
        const user = await userModel.findById(userId).select('name');
        
        if (user && user.name) {
            userNameCache[userId] = user.name;
            return user.name;
        }
        return `Unknown User (${userId.substring(0, 5)}...)`;
    } catch (err) {
        console.error("Error fetching user name:", err);
        return `Error Fetching Name (${userId.substring(0, 5)}...)`;
    }
};

const initializeSocket = (io) => {

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error: Token missing."));
        }
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            const userId = verified.userId;

            socket.userId = userId; 
            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token."));
        }
    });
    
    io.on('connection', (socket) => {
        const userId = socket.userId;
        let currentDocId = null; 

        socket.on('join-document', async (docId, callback) => {
            if (!docId) {
                return callback({ success: false, message: "Document ID required." });
            }

            const username=await getDisplayName(userId);

            try {
                const document = await docModel.findById(docId);
                if (!document) {
                    return callback({ success: false, message: "No doc found for given docId." });
                }

                if (currentDocId) {
                    socket.leave(currentDocId);
                    socket.to(currentDocId).emit('user-left', { userId: userId, name:username });
                }

                const usersInRoom = documentUsers[docId] || [];

                if(usersInRoom.filter(u=>u.id===userId).length===0){
                        usersInRoom.push({id:userId,name:username});
                        documentUsers[docId] = usersInRoom;
                    }
                
                socket.join(docId);
                currentDocId = docId;
                socket.to(docId).emit('user-joined', { userId: userId, name:username, docId: docId });

                callback({ success: true, docId: docId,activeUsers: usersInRoom });

            } catch (error) {
                console.error(`Error joining document ${docId}:`, error);
                callback({ success: false, message: "Server error joining document." });
            }
        });
        
        socket.on('leave-document', () => {
             if (currentDocId) {
                 socket.leave(currentDocId);
                 documentUsers[currentDocId] = (documentUsers[currentDocId] || []).filter(u => u.id !== userId);
                 socket.to(currentDocId).emit('user-left', { userId: userId, name: userNameCache[userId]});
                 currentDocId = null;
             }
        });
        
        socket.on('disconnect', () => {
            if (currentDocId) {
                socket.to(currentDocId).emit('user-left', { userId: userId, name:userNameCache[userId] });
                documentUsers[currentDocId] = (documentUsers[currentDocId] || []).filter(u => u.id !== userId);
                console.log(`User ${userId} disconnected from room ${currentDocId}`);
            }
        });

        socket.on('text-change', async (delta) => {
            if (!currentDocId) return;

            socket.to(currentDocId).emit('text-change', {
                userId: userId,
                name:userNameCache[userId],
                delta: delta 
            });
        });

        socket.on('document-saved', (data) => {
            if (!currentDocId) return;
  
            socket.to(currentDocId).emit('document-saved', {
                userId: userId,
                name:userNameCache[userId],
                timestamp: new Date().toISOString(),
                ...data 
            });
        });

        socket.on('send-cursor',(data)=>{
            socket.to(currentDocId).emit('cursor-update',{userId:userId,range:data.range,name:userNameCache[userId]||"non cached name"})
        })
    });
};

module.exports=initializeSocket;