import './App.css'
import AuthContextWrapper, { useAuth } from './hooks/AuthContext.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DocEditor from './pages/DocEditor.jsx'
import Page from './pages/Page.jsx'

const Redirect=()=>{
  const {isAuthenticated} = useAuth();
  return (
    isAuthenticated ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace />
  )
}

function App() {

  return (
    <div className='flex items-center w-full justify-center'>
      <BrowserRouter>
      <AuthContextWrapper>
        <Routes>

        {/*Unauthenticated Routes*/}
        {/* Use the Login page as the default landing page */}
        <Route path="/" element={<Redirect />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/*Authenticated Routes*/}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/document/:documentId" 
          element={
            <ProtectedRoute>
              <DocEditor />
            </ProtectedRoute>
          } 
        />

        </Routes>
      </AuthContextWrapper>
      </BrowserRouter>
    </div>
  )
}

export default App;
