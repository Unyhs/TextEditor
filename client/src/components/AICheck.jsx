import {grammarCheck,enhance,summarize} from '../services/ai'

function AICheck({setAiProcessing,setShowResult,setAiResult,latestStateRef}) {

        const aiGrammarCheck=async()=>{
            setAiProcessing(true);
            try{
                const response=await grammarCheck(latestStateRef.current.content);
                if(response && response.success)
                {
                    setAiResult(response.data)
                    setShowResult(true);
                }else
                {
                    console.log("error")
                    setAiResult(null)
                }
            }catch(error)
            {
                console.log("Error encountered in grammar check",error)
                setAiResult(null)
            }finally
            {
                setAiProcessing(false);
            }
        }
    
        const aiEnhance=async()=>{
            setAiProcessing(true);
            try{
                const response=await enhance(latestStateRef.current.content);
                if(response && response.success)
                {
                    setAiResult(response.data)
                    setShowResult(true);
                }else
                {
                    console.log("error")
                }
            }catch(error)
            {
                console.log("Error encountered in enhance",error)
            }finally
            {
                setAiProcessing(false);
            }
        }
    
        const aiSummarize=async()=>{
            setAiProcessing(true);
            try{
                const response=await summarize(latestStateRef.current.content);
                if(response && response.success)
                {
                    setAiResult(response.data)
                    setShowResult(true);
                }else
                {
                    console.log("error")
                }
            }catch(error)
            {
                console.log("Error encountered in summarize",error)
            }finally
            {
                setAiProcessing(false);
            }
        }
    
  return (
        <div className="mb-2 p-2 rounded flex-col items-center">
            <span className="text-indigo-800 font-bold">Check out our AI Tools</span>
            <div className='md:flex flex-col md:flex-row md:items-center w-full justify-center gap-1 md:gap-4 mt-1 md:mt-4'>
                <span
                onClick={aiGrammarCheck}
                className="text-white bg-indigo-600 md:font-bold
                            hover:bg-white hover:text-indigo-600 
                            hover:border-2 hover: border-indigo-600 hover:cursor-pointer
                            px-4 py-1 rounded-full
                            shadow-lg justify-center
                            transition-all duration-300 
                            flex items-center space-x-2 
                            transform "
                >
                <span className="inline">Grammar Check</span>
                </span>

                <span
                    onClick={aiSummarize}
                    className="text-white bg-indigo-600 md:font-bold
                            hover:bg-white hover:text-indigo-600 hover:border-2 
                            hover: border-indigo-600 hover:cursor-pointer
                            px-4 py-1 rounded-full 
                            shadow-lg justify-center
                            transition-all duration-300 
                            flex items-center space-x-2 
                            transform mt-1 md:mt-0"
                    >
                    <span className="inline">Summary</span>
                </span>

                <span
                onClick={aiEnhance}
                    className="text-white bg-indigo-600 md:font-bold
                            hover:bg-white hover:text-indigo-600 hover:border-2 
                            hover: border-indigo-600 hover:cursor-pointer
                            px-4 py-1 rounded-full 
                            shadow-lg justify-center
                            transition-all duration-300 
                            flex items-center space-x-2 
                            transform mt-1 md:mt-0"
                    >
                    <span className="inline">Enhance</span>
                </span>
            </div>
        </div>
)
}

export default AICheck