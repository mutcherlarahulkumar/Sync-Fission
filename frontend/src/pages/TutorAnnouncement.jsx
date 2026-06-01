import Announcement from "../components/Announcement"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function TutorAnnouncement() {
    const location = useLocation();
    const class_id = location.state?.id;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    function fetchAnnouncements() {
        const config = getAuthConfig();
        axios.get(`${API_URL}/tutor/class/${class_id}/announcements`, config)
            .then((response) => {
                setAnnouncements(response.data.announcements || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    function postAnnouncement(e) {
        e.preventDefault();
        if (!title || !description) {
            toast.error('Title and description are required');
            return;
        }
        const config = getAuthConfig();
        axios.post(`${API_URL}/tutor/class/${class_id}/addannouncement`, { title, description }, config)
            .then(() => {
                toast.success('Announcement posted successfully');
                setTitle('');
                setDescription('');
                fetchAnnouncements();
            })
            .catch(() => toast.error('Failed to post announcement'));
    }

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen p-6">
            <ToastContainer />
            <div className="bg-gray-800 p-6 rounded-lg mx-4">
                <div className="text-2xl font-bold mb-6">Announcements</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-bold mb-4">Post New Announcement</h2>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <form className="space-y-4" onSubmit={postAnnouncement}>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Announcement title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 h-24 resize-none"
                                        placeholder="Announcement details"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Post Announcement
                                </button>
                            </form>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-4">All Announcements</h2>
                        <div className="bg-gray-700 rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {announcements.length === 0 ? (
                                <p className="text-gray-400 text-sm">No announcements yet.</p>
                            ) : (
                                [...announcements].reverse().map((a) => (
                                    <Announcement key={a.id} title={a.title} description={a.description} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
