import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCommentDots, faUsers, faFile, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Spinner from '../components/Spinner';
import { API_URL, getAuthConfig } from '../api';

export default function ClassRoomStudent() {
    const navigate = useNavigate();
    const location = useLocation();
    const class_id = (location.state || {}).id;

    const [isLoading, setIsLoading] = useState(true);
    const [classInfo, setClassInfo] = useState({});
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);

    useEffect(() => {
        const config = getAuthConfig();
        Promise.all([
            axios.get(`${API_URL}/student/class/${class_id}`, config),
            axios.get(`${API_URL}/student/class/${class_id}/announcements`, config),
        ])
            .then(([classRes, announcementRes]) => {
                setClassInfo(classRes.data.classInfo || {});
                const announcements = announcementRes.data.announcements || [];
                if (announcements.length > 0) {
                    setLatestAnnouncement(announcements[announcements.length - 1]);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [class_id]);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen">
            <ToastContainer />
            <div className="bg-gray-800 p-6 rounded-lg mx-4 mt-4">
                <div className="text-2xl font-bold mb-1">{classInfo.name}</div>
                <div className="grid grid-cols-2 gap-2 text-gray-400 text-sm mb-6 mt-2">
                    <div>{classInfo.description}</div>
                    <div>Book Ref: {classInfo.book_ref || '—'}</div>
                    <div>Prerequisites: {classInfo.prereqs || '—'}</div>
                </div>

                <div className="mb-6">
                    <div className="text-base font-semibold pb-3">Latest Announcement</div>
                    <div className="bg-gray-700 rounded-lg p-4 min-h-[80px]">
                        {latestAnnouncement ? (
                            <>
                                <p className="font-medium">{latestAnnouncement.title}</p>
                                <p className="text-gray-400 text-sm mt-1">{latestAnnouncement.description}</p>
                            </>
                        ) : (
                            <p className="text-gray-500 text-sm">No announcements yet.</p>
                        )}
                    </div>
                </div>

                <div className="text-xl font-bold mt-6 mb-5">Classroom Options</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
                    {[
                        { icon: faChalkboardTeacher, label: 'View Announcements', onClick: () => navigate('/student-announcement', { state: { id: class_id } }) },
                        { icon: faDownload, label: 'View Resources', onClick: () => navigate('/student-resources', { state: { id: class_id } }) },
                        { icon: faCommentDots, label: 'Ask Doubts', onClick: () => navigate('/doubt-student', { state: { id: class_id } }) },
                        { icon: faUsers, label: 'View Participants', onClick: () => navigate('/view-participants-student', { state: { id: class_id } }) },
                        { icon: faFile, label: 'View Assignments', onClick: () => navigate('/student-assignment', { state: { id: class_id } }) },
                    ].map(({ icon, label, onClick }) => (
                        <button
                            key={label}
                            onClick={onClick}
                            className="bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2 p-4 rounded-lg transition-colors text-sm font-medium"
                        >
                            <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
