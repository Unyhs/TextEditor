import { createContext,useContext,useEffect, useState } from "react"
import { getCurrentUser } from '../services/user';
import { socket } from '../services/index';
import { useNavigate } from "react-router-dom";

export const AuthContext=createContext({user:null, isAuthenticated:false, loading:true});

const AuthContextWrapper=({children})=>{
    const [user, setUser]=useState(null);
    const [token,setToken]=useState(null);
    const [loading,setLoading]=useState(true);
    const [isAuthenticated,setIsAuthenticated]=useState(false);
    const navigate=useNavigate();

    const updateCursorColor=()=>{
        const colors=["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF5", "#F5FF33"];
        const randomColor=colors[Math.floor(Math.random()*colors.length)];
        return randomColor;
    }

    useEffect(()=>{
        const savedToken = localStorage.getItem('token');
        if (savedToken) setToken(savedToken);
        else setLoading(false);
    },[])

    const getCurrUser=async()=>{
       try{
        const response=await getCurrentUser();
        if(response.success){
            const cursorColor=updateCursorColor();
            setUser({...response.data,cursorColor});
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
        socket.auth={token:null};
        socket.disconnect();
        navigate('/login');
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