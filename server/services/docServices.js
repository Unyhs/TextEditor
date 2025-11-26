const docModel=require('../models/docModel')
const userModel=require('../models/userModel')
const jwt=require('jsonwebtoken')
const crypto =require('crypto'); // Node's built-in module for secure token generation
const { sendError } =require('../utils/errorHandling');

const createNewDoc = async (req, res) => {
    try {
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const ownerId = verifiedToken.userId; 
        
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
        const token=req.headers?.authorization?.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 
        
        const documents = await docModel.find({
            $or: [
                { owner: userId },
                { editors: userId },
            ]
        })
        .select('_id title owner editors seekers updatedAt') 
        .populate('owner', '_id name');
        
        // 2. Map over the results to inject permissions and clean up data.
        const documentsWithPermissions = documents.map(doc => {

            const docObject = doc.toObject(); 
            
            let permission = 'viewer'; // Default lowest permission
            
            if (docObject.owner===userId) {
                permission = 'owner';
            } else if (docObject?.editors?.some(editorId => editorId.equals(userId))) {
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

const getAllDocs = async (req, res) => {
    try {
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 
        
        const documents = await docModel.find()
        .select('_id title owner editors seekers updatedAt') 
        .populate('owner', 'name');
        
        // 2. Map over the results to inject permissions and clean up data.
        const documentsWithPermissions = documents.map(doc => {

            const docObject = doc.toObject(); 
            
            let permission = 'viewer'; // Default lowest permission
            
            if (docObject.owner===userId) {
                permission = 'owner';
            } else if (docObject.editors?.some(editorId => editorId.equals(userId))) {
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

        const userPromises = document.seekers.map((seekerId) => {
            return userModel.findById(seekerId).select('name').lean(); 
        });

        const seekerObjects = await Promise.all(userPromises);
        
        const docSeekers = seekerObjects
            .filter(seeker => seeker && seeker.name)
            .map(seeker => ({
                id: seeker._id,      
                name: seeker.name
            }));

        // Authorization Check: Must be owner, editor, or viewer
        const isAuthorizedToEdit = 
            document.owner.equals(userId) || 
            document.editors.includes(userId);

        const isOwner=document.owner.equals(userId);

        const newDocument = document.toObject();
        newDocument.isAuthorizedToEdit = isAuthorizedToEdit;
        newDocument.isOwner=isOwner;
        newDocument.docSeekers=docSeekers;

        res.status(200).send({
            success: true,
            data: newDocument,
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

        // Find and check authorization (only editors/owners can update)
        const document = await docModel.findById(id);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        // Authorization Check: Must be owner or editor
        const isAuthorizedToEdit = 
            document.owner.equals(userId) || 
            document.editors.includes(userId);

        const isOwner=document.owner.equals(userId);

        if (!isAuthorizedToEdit) {
            return sendError(res, "Unauthorized: Only owners and editors can modify this document.", 403);
        }

        // Update fields
        if (title !== undefined) document.title = title;
        if (content !== undefined) document.content = content;

        await document.save();

        const userPromises = document.seekers.map((seekerId) => {
            return userModel.findById(seekerId).select('name').lean(); 
        });

        const seekerObjects = await Promise.all(userPromises);
        
        const docSeekers = seekerObjects
            .filter(seeker => seeker && seeker.name)
            .map(seeker => ({
                id: seeker._id,      
                name: seeker.name
            }));

        const newDoc=document.toObject();
        newDoc.isAuthorizedToEdit=isAuthorizedToEdit;
        newDoc.isOwner=isOwner;
        newDoc.docSeekers=docSeekers;

        res.status(200).send({
            success: true,
            message: "Document updated successfully.",
            data: newDoc,
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

const seekEditAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const token=req.headers.authorization.split(" ")[1]
        const verifiedToken=jwt.verify(token,process.env.jwt_secret)
        const userId = verifiedToken.userId; 

        // Find and check authorization (only editors/owners can update)
        const document = await docModel.findById(id);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        const docSeekers=document.seekers;

        if(!docSeekers.includes(userId))
        {
            docSeekers.push(userId);
        }

        document.seekers=docSeekers;

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

const giveEditAccess = async (req, res) => {
    try {
        const {id,seekerId}=req.body;
        console.log(id,seekerId)

        const ObjectId = docModel.base.Types.ObjectId; 
        
        const seekerObjectId = new ObjectId(seekerId);
        const docId = new ObjectId(id);

        // Find and check authorization (only editors/owners can update)
        const document = await docModel.findById(docId);

        if (!document) {
            return sendError(res, "Document not found.", 404);
        }

        const docEditors=document.editors;

        if(!docEditors.includes(seekerObjectId))
        {
            console.log("editor push")
            docEditors.push(seekerObjectId);
        }

        const upSeekers = document.seekers.filter((seeker) => !seeker.equals(seekerObjectId));

        document.editors=docEditors;
        document.seekers=upSeekers;

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

module.exports={
    createNewDoc,
    getUserDocs,
    getDocById,
    updateDocById,
    deleteDocById,
    generateShareableLinkById,
    getAllDocs,
    seekEditAccess,
    giveEditAccess
}