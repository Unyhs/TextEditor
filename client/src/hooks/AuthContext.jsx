import { createContext,useContext,useEffect, useState } from "react"
import { getCurrentUser } from '../services/user';

export const AuthContext=createContext({user:null, isAuthenticated:false, loading:true});

const AuthContextWrapper=({children})=>{
    const [user, setUser]=useState(null);
    const [token,setToken]=useState(null);
    const [loading,setLoading]=useState(true);
    const [isAuthenticated,setIsAuthenticated]=useState(false);
    console.log("user in auth context", user, "isAuthenticated",isAuthenticated)

    useEffect(()=>{
        const savedToken = localStorage.getItem('token');
        console.log("saved toklen",savedToken)
        if (savedToken) setToken(savedToken);
        else setLoading(false);
    },[])

    const getCurrUser=async()=>{
       try{
        const response=await getCurrentUser();
        if(response.success){
            setUser(response.data);
            setIsAuthenticated(true);
            setLoading(false);
        }else{
            logoutUser();
        }   
       }catch(err){
        console.log(err)
        logoutUser();
       }
    }

    const logoutUser=()=>{
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
        localStorage.removeItem('token');
        setLoading(false);
    }

    useEffect(() => {
        if (token) {
            getCurrUser();
        }
    }, [token]);

    return  <AuthContext.Provider value={{user,isAuthenticated,loading,logoutUser,getCurrUser}}>{children}</AuthContext.Provider>
}

export const useAuth=()=>useContext(AuthContext);

export default AuthContextWrapper;