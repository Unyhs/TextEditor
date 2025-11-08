import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { loginUser } from '../services/user';
import { useAuth } from '../hooks/AuthContext';

const FormItem = ({ label, name, type = 'text', placeholder, value, onChange, required = true }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {required && <p className="text-xs text-red-500 mt-1 hidden peer-invalid:block">This field is mandatory.</p>}
    </div>
);

function LoginPage() {
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({email: '', password: '' });
    const navigate=useNavigate();
    const {getCurrUser}=useAuth();

    const onFinish = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: 'loading' });

        try {

            // Basic client-side validation check (can be expanded)
            if (!formData.email || !formData.password) {
                setMessage({ text: "Please fill all mandatory fields.", type: 'error' });
                return;
            }

            console.log("formData",formData)
            const response = await loginUser(formData);

            if (response.success) {
                setMessage({ text: response.message, type: 'success' });
                localStorage.setItem("token",response.data)
                await getCurrUser();
                resetForm();
                navigate('/dashboard');

            } else {
                setMessage({ text: response.message || "Registration failed.", type: 'error' });
            }
        } catch (err) {
            setMessage({ text: err.message || "An unexpected error occurred.", type: 'error' });
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({ email: '', password: '' });
    };

    const renderFormContent = () => (
        <form onSubmit={onFinish} className="w-full p-6">
            <FormItem 
                label="Email Address" 
                name="email" 
                type="email" 
                placeholder="Enter your email" 
                value={formData.email}
                onChange={handleChange}
            />
            <FormItem 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="Enter your password" 
                value={formData.password}
                onChange={handleChange}
            />
            
            <div 
                onClick={onFinish}
                type="submit" 
                className="w-full py-2 mt-4 text-white bg-indigo-800 font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
                Login
            </div>
        </form>
    );

    return (
        <div className="flex justify-center items-center min-h-screen w-11/12 bg-gray-100">
            {/* Main Card Container */}
            <div className="flex flex-col w-full max-w-md bg-white rounded-xl shadow-2xl p-6 transition duration-300">
                
                {/* Header */}
                <h2 className="text-2xl font-bold text-center text-gray-800 pt-2 pb-4">
                    Login 
                </h2>
                
                {/* Message/Notification Display */}
                {message.text && message.type !== 'loading' && (
                    <div className={`p-3 mt-4 text-center rounded-lg text-sm ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}
                {message.type === 'loading' && (
                    <div className="p-3 mt-4 text-center text-sm text-indigo-600">
                        Processing...
                    </div>
                )}
                
                {/* Form Content */}
                <main className="mt-4">
                    {renderFormContent()}
                </main>

                {/* Link to Login */}
                <div className="text-center pt-4 border-t mt-4">
                    <p className="text-sm text-gray-600">
                        New Here? 
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1">
                            Click here to register.
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;