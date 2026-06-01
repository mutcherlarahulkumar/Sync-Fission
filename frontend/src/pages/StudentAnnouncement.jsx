import Announcement from "../components/Announcement"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { ToastContainer } from "react-toastify"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function StudentAnnouncement() {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const class_id = (location.state || {}).id;
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const config = getAuthConfig();
        axios.get(`${API_URL}/student/class/${class_id}/announcements`, config)
            .then((response) => {
                setAnnouncements(response.data.announcements || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen p-6">
            <ToastContainer />
            <div className="bg-gray-800 p-6 rounded-lg mx-4">
                <div className="text-2xl font-bold mb-6">Announcements</div>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3 max-h-[600px] overflow-y-auto">
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
    );
}
