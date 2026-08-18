import student from '../assets/students.jpg';
import tutor from '../assets/tutor.png';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL, setAuth } from '../api';

export default function Signin() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role || 'student';
    const [user, setUser] = useState(role.toUpperCase());

    const personimage = user === 'STUDENT' ? student : tutor;

    function changeUser() {
        setUser(prev => prev === 'STUDENT' ? 'TUTOR' : 'STUDENT');
    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function buttonClicked(e) {
        e.preventDefault();
        if (!email || !password) {
            toast.error('All fields are required');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/signin/${user.toLowerCase()}`, { email, password });
            // The role is stored alongside the token so the route guard can
            // keep a student out of the tutor views without a round trip.
            setAuth(response.data.token, response.data.role || user.toLowerCase());
            toast.success(response.data.message);
            // Send them back where they were headed before the guard bounced them.
            navigate(location.state?.from || `/${user.toLowerCase()}-dashboard`, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.error || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen">
            <ToastContainer />
            <div className="flex min-h-screen items-center">
                <div className="w-1/2 pl-12 ml-3">
                    <div className="bg-gray-800 rounded-lg w-max p-10">
                        <div className="text-3xl font-bold mb-6">Sign In as {user}</div>
                        <form className="max-w-sm mx-auto">
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-medium text-white">Email</label>
                                <input
                                    type="email"
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="yourname@gmail.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-medium text-white">Password</label>
                                <input
                                    type="password"
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
                                onClick={buttonClicked}
                            >
                                Sign In
                            </button>
                        </form>
                        <div className="pt-4 text-gray-400">
                            Don't have an account?{' '}
                            <button
                                className="text-white hover:underline"
                                onClick={() => navigate('/signup', { state: { role: user.toLowerCase() } })}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center">
                    <div className="font-bold text-2xl">
                        Signing In as a <span className="text-3xl text-purple-500">{user}</span>
                    </div>
                    <img src={personimage} alt={user} className="w-2/3 rounded-2xl mt-8 light-on-hover" />
                    <div className="mt-4 text-gray-400">
                        Not a {user}?{' '}
                        <span className="text-white hover:cursor-pointer hover:underline" onClick={changeUser}>
                            Change Role
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
