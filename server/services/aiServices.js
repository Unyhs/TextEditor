require('dotenv').config();
const GoogleGenAI = require('@google/genai').GoogleGenAI;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const { sendError } =require('../utils/errorHandling');

const promptGemini= async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new Error("AI service request failed: " + (error.message || "Unknown API Error"));
  }
}

const grammarCheck=async(req,res)=>{
  try{
      const {content}=req.body; 

      if(!content || content.length==0)
      {
        return sendError(res,"Not enough content",402);
      }

      const prompt=`We have received content : ${content}. 
                Please note that the content is an HTML string and the output should be a String. 
                Please carry out a complete grammar check- including spacing and spell check and
                send the revised content back. Do not add any comments. Please send plain text back`
      const revisedContent=await promptGemini(prompt);

      res.status(200).send(
        {
          success:true,
          data:revisedContent,
          message:"Grammar check complete"
        }
      )
  }catch(error){
      console.error("Error while grammar check:", error);
      sendError(res, "Failed to create new document.");
  }
}

const enhance=async(req,res)=>{
  try{
      const {content}=req.body; 

      if(!content || content.length<20)
      {
        return sendError(res,"Not enough content",402);
      }

      const prompt=`We have received content : ${content}. 
                    Please help the user enhance the text by enhanced sentence formation, correct grammar and spelling, shuffling sentences or changing structure.
                    Please note that the content is an HTML string and the output should be a String. Please send plain text back.
                    Do not :
                    1. add any comments.
                    2. add any new content or any information that already doesnt exist
                    `
      const revisedContent=await promptGemini(prompt);

      res.status(200).send(
        {
          success:true,
          data:revisedContent,
          message:"Enhancement complete"
        }
      )
  }catch(error){
      console.error("Error while enhancing:", error);
      sendError(res, "Failed to enhance document.");
  }
}

const summarize=async(req,res)=>{
  try{
      const {content}=req.body; 

      if(!content || content.length<50)
      {
        return sendError(res,"Not enough content",402);
      }

      const prompt=`We have received content : ${content}. 
                    Please help the user summarize the content. The word limit should remain between 50-200 words depending on the length of content.
                    The length of summary should not be more than 10% of original content and not less than 5 % of original content length.
                    Please note that the content is an HTML string and the output should be a String. Please send plain text back.
                    Maintain the tone and essence of the original text.
                    Do not :
                    1. add any comments.
                    2. add any new content or any information that already doesnt exist
                    `
      const revisedContent=await promptGemini(prompt);

      res.status(200).send(
        {
          success:true,
          data:revisedContent,
          message:"Summary complete"
        }
      )
  }catch(error){
      console.error("Error while summarizing:", error);
      sendError(res, "Failed to summarize document.");
  }
}

const complete=async(req,res)=>{
  try{
      const {content}=req.body; 

      if(!content || content.length<20)
      {
        return sendError(res,"Not enough content",402);
      }

      const prompt=`We have received content : ${content}. 
                    You will read the entire text, understand teh context and tone of the text and try to give a suggestion as to the following: 
                    phrase completion and sentence completion.Please note that the content is an HTML string and the output should be a String. Please send plain text back.
                    Do not :
                    1. add any comments.
                    `
      const revisedContent=await promptGemini(prompt);

      res.status(200).send(
        {
          success:true,
          data:revisedContent,
          message:"Auto complete done"
        }
      )
  }catch(error){
      console.error("Error while auto complete:", error);
      sendError(res, "Failed to auto complete.");
  }
}

const suggestions=async(req,res)=>{
  try{
      const {content}=req.body; 

      if(!content || content.length<20)
      {
        return sendError(res,"Not enough content",402);
      }

      const prompt=`We have received content : ${content}. 
                    You will read the entire text, understand the context and tone of the text and try to give a suggestion as to the following: 
                    paragraph completion. Please note that the content is an HTML string and the output should be a String. Please send plain text back.
                    Do not :
                    1. add any comments.
                    `
      const revisedContent=await promptGemini(prompt);

      res.status(200).send(
        {
          success:true,
          data:revisedContent,
          message:"Suggestions done"
        }
      )
  }catch(error){
      console.error("Error while suggesting:", error);
      sendError(res, "Failed to suggest.");
  }
}

module.exports={grammarCheck,enhance,summarize,complete,suggestions};
