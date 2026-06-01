import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import DoubtCardStudent from '../components/DoubtCardStudent';
import { API_URL, getAuthConfig } from '../api';

export default function DoubtStudent() {
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const class_id = location.state?.id;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    function fetchDoubts() {
        const config = getAuthConfig();
        axios.get(`${API_URL}/student/class/${class_id}/doubts`, config)
            .then((res) => {
                setDoubts(res.data.doubts || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchDoubts();
    }, [class_id]);

    function askDoubt(e) {
        e.preventDefault();
        if (!title || !description) {
            toast.error('Please fill all fields');
            return;
        }
        const config = getAuthConfig();
        axios.post(`${API_URL}/student/class/${class_id}/askdoubt`, { title, description }, config)
            .then(() => {
                toast.success('Doubt submitted successfully');
                setTitle('');
                setDescription('');
                fetchDoubts();
            })
            .catch(() => toast.error('Failed to submit doubt'));
    }

    if (loading) return <Spinner />;

    return (
        <div className="bg-[#03040e] min-h-screen">
            <ToastContainer />
            <div className="container mx-auto py-8 px-4 bg-gray-800 text-white min-h-screen">
                <h1 className="text-2xl font-bold mb-8">Doubts</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <form className="space-y-4" onSubmit={askDoubt}>
                        <h3 className="text-lg font-semibold">Submit a New Doubt</h3>
                        <div>
                            <label className="block mb-1 text-sm font-medium">Title</label>
                            <input
                                placeholder="What is your doubt about?"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium">Description</label>
                            <textarea
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 h-28 resize-none"
                                placeholder="Describe your doubt in detail"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Submit Doubt
                        </button>
                    </form>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Previous Doubts</h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {doubts.length === 0 ? (
                                <p className="text-gray-400 text-sm">No doubts yet.</p>
                            ) : (
                                doubts.map((doubt) => (
                                    <DoubtCardStudent
                                        key={doubt.id}
                                        title={doubt.title}
                                        description={doubt.description}
                                        class_id={class_id}
                                        doubt_id={doubt.id}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
