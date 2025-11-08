const express=require('express')
const aiRouter=express.Router()
const {grammarCheck,enhance,summarize,complete,suggestions} =require('../services/aiServices.js')

aiRouter.post("/grammar-check",grammarCheck)
aiRouter.post("/enhance",enhance)
aiRouter.post("/summarize",summarize)
aiRouter.post("/complete",complete)
aiRouter.post("/suggestions",suggestions)

module.exports=aiRouter