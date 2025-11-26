const docModel =require('../models/docModel.js');
const jwt = require('jsonwebtoken');
const documentUsers = {};

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

            try {
                const document = await docModel.findById(docId);
                if (!document) {
                    return callback({ success: false, message: "No doc found for given docId." });
                }

                if (currentDocId) {
                    socket.leave(currentDocId);
                    socket.to(currentDocId).emit('user-left', { userId: userId });
                }

                const usersInRoom = documentUsers[docId] || [];

                if (!usersInRoom.includes(userId)) {
                    usersInRoom.push(userId);
                    documentUsers[docId] = usersInRoom;
        }
                
                socket.join(docId);
                currentDocId = docId;

                socket.to(docId).emit('user-joined', { userId: userId, docId: docId });

                callback({ success: true, docId: docId,activeUsers: usersInRoom });

            } catch (error) {
                console.error(`Error joining document ${docId}:`, error);
                callback({ success: false, message: "Server error joining document." });
            }
        });
        
        socket.on('leave-document', () => {
             if (currentDocId) {
                 socket.leave(currentDocId);
                 documentUsers[currentDocId] = (documentUsers[currentDocId] || []).filter(u => u !== userId);
                 socket.to(currentDocId).emit('user-left', { userId: userId });
                 currentDocId = null;
             }
        });
        
        socket.on('disconnect', () => {
            if (currentDocId) {
                socket.to(currentDocId).emit('user-left', { userId: userId });
                documentUsers[currentDocId] = (documentUsers[currentDocId] || []).filter(u => u !== userId);
                console.log(`User ${userId} disconnected from room ${currentDocId}`);
            }
        });

        socket.on('text-change', async (delta) => {
            if (!currentDocId) return;

            socket.to(currentDocId).emit('text-change', {
                userId: userId,
                delta: delta 
            });
        });

        socket.on('document-saved', (data) => {
            if (!currentDocId) return;
  
            socket.to(currentDocId).emit('document-saved', {
                userId: userId,
                timestamp: new Date().toISOString(),
                ...data 
            });
        });
    });
};

module.exports=initializeSocket;