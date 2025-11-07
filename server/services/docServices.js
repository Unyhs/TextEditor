const docModel=require('../models/docModel')
const jwt=require('jsonwebtoken')
const crypto =require('crypto'); // Node's built-in module for secure token generation

// --- Helper for consistent error response ---
const sendError = (res, message, status = 500) => {
    return res.status(status).send({ success: false, message });
};

const createNewDoc = async (req, res) => {
    try {
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const ownerId = verifiedToken.userId; 

        console.log("owner is", ownerId)
        
        // Use a default title and empty content for a new document
        const newDocument = new docModel({
            owner: ownerId,
            title: "Untitled Document",
            content: "", 
            editors: [ownerId], // Owner always has edit permissions
        });

        await newDocument.save();
        
        console.log("new document is ", newDocument)
        // Return the new document ID for frontend navigation
        res.status(201).send({
            success: true,
            message: "Document created successfully.",
            data: newDocument._id,
        });

    } catch (error) {
        console.error("Error creating document:", error);
        sendError(res, "Failed to create new document.");
    }
};

const getUserDocs = async (req, res) => {
    try {
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 
        
        const documents = await docModel.find({
            $or: [
                { owner: userId },
                { editors: userId },
                { viewers: userId }
            ]
        })
        .select('_id title owner editors viewers updatedAt') 
        .populate('owner', 'name');
        
        // 2. Map over the results to inject permissions and clean up data.
        const documentsWithPermissions = documents.map(doc => {

            const docObject = doc.toObject(); 
            
            let permission = 'viewer'; // Default lowest permission
            
            if (docObject.owner===userId) {
                permission = 'owner';
            } else if (docObject.editors.some(editorId => editorId.equals(userId))) {
                permission = 'editor';
            }
            
            return {
                _id: docObject._id,
                title: docObject.title,
                lastModified: docObject.updatedAt,
                ownerName: docObject.owner.name,
                userPermission: permission,
            };
        });
        
        res.status(200).send({
            success: true,
            data: documentsWithPermissions,
        });

    } catch (error) {
        console.error("Error fetching user documents:", error);
        sendError(res, "Failed to fetch user documents.");
    }
};

const getDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 

        const document = await docModel.findById(id);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        // Authorization Check: Must be owner, editor, or viewer
        const isAuthorized = 
            document.owner.equals(userId) || 
            document.editors.includes(userId) || 
            document.viewers.includes(userId);

        if (!isAuthorized) {
            return sendError(res, "Unauthorized access to document.", 403);
        }

        res.status(200).send({
            success: true,
            data: document,
        });

    } catch (error) {
        console.error("Error fetching document by ID:", error);
        sendError(res, "Failed to fetch document.", 500);
    }
};

const updateDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 
        const { title, content } = req.body;

        console.log("formdata",title," ",content)

        // Find and check authorization (only editors/owners can update)
        const document = await docModel.findById(id);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        // Authorization Check: Must be owner or editor
        const isAuthorized = 
            document.owner.equals(userId) || 
            document.editors.includes(userId);

        if (!isAuthorized) {
            return sendError(res, "Unauthorized: Only owners and editors can modify this document.", 403);
        }

        // Update fields
        if (title !== undefined) document.title = title;
        if (content !== undefined) document.content = content;

        await document.save();

        res.status(200).send({
            success: true,
            message: "Document updated successfully.",
            data: document,
        });

    } catch (error) {
        console.error("Error updating document:", error);
        sendError(res, "Failed to update document.", 500);
    }
};

const deleteDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 

        const document = await docModel.findById(id);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        // Authorization Check: Only the owner can delete
        if (!document.owner.equals(userId)) {
            return sendError(res, "Unauthorized: Only the owner can delete this document.", 403);
        }

        await docModel.deleteOne({ _id: id });
        
        res.status(200).send({
            success: true,
            message: "Document deleted successfully.",
        });

    } catch (error) {
        console.error("Error deleting document:", error);
        sendError(res, "Failed to delete document.", 500);
    }
};

const generateShareableLinkById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        // Assume req.body contains { accessLevel: 'viewer' | 'editor' }
        const { accessLevel = 'viewer' } = req.body; 

        const document = await Document.findById(id);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        // Authorization Check: Only the owner can generate share links (or you can allow editors)
        if (!document.owner.equals(userId)) {
            return sendError(res, "Unauthorized: Only the owner can share this document.", 403);
        }

        // Generate a secure, non-guessable token (e.g., 32 hex characters)
        const token = crypto.randomBytes(16).toString('hex'); 
        
        // Update the document with the new share token details
        document.shareToken = {
            token: token,
            accessLevel: accessLevel
        };

        await document.save();

        // Construct the full shareable URL (assuming frontend base URL is known)
        // NOTE: In production, use an environment variable for the base URL
        const shareableUrl = `http://localhost:5173/share/${token}`; 

        res.status(200).send({
            success: true,
            message: "Shareable link generated.",
            shareLink: shareableUrl,
        });

    } catch (error) {
        console.error("Error generating share link:", error);
        sendError(res, "Failed to generate share link.", 500);
    }
};

module.exports={
    createNewDoc,
    getUserDocs,
    getDocById,
    updateDocById,
    deleteDocById,
    generateShareableLinkById
}