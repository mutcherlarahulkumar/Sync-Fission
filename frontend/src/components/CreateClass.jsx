import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { API_URL, getAuthConfig } from '../api';

export default function CreateClass({ setShow, onCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [book_ref, setBookRef] = useState('');
    const [prereqs, setPrereqs] = useState('');

    async function buttonClicked(e) {
        e.preventDefault();
        if (!name || !description) {
            toast.error('Class name and description are required');
            return;
        }
        const config = getAuthConfig();
        try {
            await axios.post(`${API_URL}/tutor/createclass`, { name, description, book_ref, prereqs }, config);
            toast.success('Class created successfully!');
            setShow(false);
            if (onCreated) onCreated();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create class');
        }
    }

    return (
        <div className="w-96">
            <ToastContainer />
            <div className="text-xl font-bold mb-5 text-center">Create New Class</div>
            <form className="space-y-4" onSubmit={buttonClicked}>
                <div className="relative z-0 w-full group">
                    <input
                        type="text"
                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                        placeholder=" "
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        Class Name *
                    </label>
                </div>
                <div className="relative z-0 w-full group">
                    <input
                        type="text"
                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                        placeholder=" "
                        required
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <label className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        Class Description *
                    </label>
                </div>
                <div className="relative z-0 w-full group">
                    <input
                        type="text"
                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                        placeholder=" "
                        onChange={(e) => setPrereqs(e.target.value)}
                    />
                    <label className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        Prerequisites
                    </label>
                </div>
                <div className="relative z-0 w-full group">
                    <input
                        type="text"
                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                        placeholder=" "
                        onChange={(e) => setBookRef(e.target.value)}
                    />
                    <label className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        Book References
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full text-white bg-blue-700 hover:bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors mt-4"
                >
                    Create Class
                </button>
            </form>
        </div>
    );
}
