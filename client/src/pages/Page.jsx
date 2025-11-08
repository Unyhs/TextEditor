import React, { useEffect } from 'react'
import {axiosInstance} from "../services/index"

function Page() {
    const content="from where yoou get this";
    const payload={
        content:content
    };

    const aiCheck = async () => {
        try {
            const response=await axiosInstance.post('/api/ai/grammar-check',payload);
            console.log(response?.data);
        }catch (error) {
            console.error("Error checking AI service:", error);
        }
    }

    useEffect(() => {
        aiCheck();
    }, []);

  return (
    <div>Page</div>
  )
}

export default Page