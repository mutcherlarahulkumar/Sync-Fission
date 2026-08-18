import student from '../assets/students.jpg';
import tutor from '../assets/tutor.png';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { API_URL, setAuth } from '../api';

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role || 'student';
    const [user, setUser] = useState(role.toUpperCase());

    const personimage = user === 'STUDENT' ? student : tutor;

    function changeUser() {
        setUser(prev => prev === 'STUDENT' ? 'TUTOR' : 'STUDENT');
    }

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');

    async function buttonClicked(e) {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password || !passwordCheck) {
            toast.error('All fields are required');
            return;
        }
        if (password !== passwordCheck) {
            toast.error('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/signup/${user.toLowerCase()}`, {
                firstname: firstName,
                lastname: lastName,
                email,
                password,
            });
            setAuth(response.data.token, response.data.role || user.toLowerCase());
            toast.success(response.data.message);
            navigate(`/${user.toLowerCase()}-dashboard`, { replace: true });
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
                        <form className="max-w-md mx-auto">
                            <div className="text-3xl font-bold mb-6">Sign Up as {user}</div>
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="relative z-0 w-full mb-5 group">
                                    <input
                                        type="text"
                                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        placeholder=" "
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                        First name
                                    </label>
                                </div>
                                <div className="relative z-0 w-full mb-5 group">
                                    <input
                                        type="text"
                                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        placeholder=" "
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                        Last name
                                    </label>
                                </div>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="email"
                                    className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" "
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Email address
                                </label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="password"
                                    className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" "
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Password
                                </label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="password"
                                    className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" "
                                    onChange={(e) => setPasswordCheck(e.target.value)}
                                    required
                                />
                                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Confirm password
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
                                onClick={buttonClicked}
                            >
                                Sign Up
                            </button>
                        </form>
                        <div className="pt-4 text-gray-400">
                            Already have an account?{' '}
                            <button
                                className="text-white hover:underline"
                                onClick={() => navigate('/signin', { state: { role: user.toLowerCase() } })}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center">
                    <div className="font-bold text-2xl">
                        Signing Up as a <span className="text-3xl text-purple-500">{user}</span>
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
