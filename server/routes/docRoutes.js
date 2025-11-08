const express=require('express')
const docRouter=express.Router()
const {createNewDoc,getUserDocs,getDocById,updateDocById,deleteDocById,generateShareableLinkById,getAllDocs} =require('../services/docServices.js')

docRouter.post("/",createNewDoc)
docRouter.get("/",getUserDocs)
docRouter.get("/all",getAllDocs)
docRouter.get('/:id', getDocById)
docRouter.put('/:id', updateDocById)
docRouter.delete('/:id', deleteDocById)
docRouter.post("/:id/share",generateShareableLinkById)

module.exports=docRouter