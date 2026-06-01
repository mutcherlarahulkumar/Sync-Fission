import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload, faCommentDots, faFileUpload, faUserFriends, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { API_URL, getAuthConfig } from '../api';

export default function ClassRoomTutor() {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const class_id = (location.state || {}).id;

    const [classInfo, setClassInfo] = useState({});
    const [classCode, setClassCode] = useState('');
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);

    useEffect(() => {
        const config = getAuthConfig();
        Promise.all([
            axios.get(`${API_URL}/tutor/class/${class_id}`, config),
            axios.get(`${API_URL}/tutor/class/${class_id}/announcements`, config),
        ])
            .then(([classRes, announcementRes]) => {
                setClassInfo(classRes.data.classInfo || {});
                setClassCode(classRes.data.classcode || '');
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div>
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
                    <div>
                        <div className="text-base font-semibold pb-3">Class Code</div>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs font-mono text-gray-300 truncate">
                                    {classCode.substring(0, 28)}...
                                </span>
                                <button
                                    className="bg-purple-700 hover:bg-purple-600 text-white rounded-lg px-3 py-1.5 text-sm shrink-0 transition-colors"
                                    onClick={() => {
                                        navigator.clipboard.writeText(classCode);
                                        toast.success("Class code copied!");
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xl font-bold mt-8 mb-5">Classroom Options</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
                    {[
                        { icon: faPlus, label: 'Add Announcement', onClick: () => navigate('/tutor-announcement', { state: { id: class_id } }) },
                        { icon: faUpload, label: 'Add Resources', onClick: () => navigate('/tutor-resources', { state: { id: class_id } }) },
                        { icon: faCommentDots, label: 'Solve Doubts', onClick: () => navigate('/doubt-tutor', { state: { id: class_id } }) },
                        { icon: faUserFriends, label: 'All Participants', onClick: () => navigate('/view-participants', { state: { id: class_id } }) },
                        { icon: faFileUpload, label: 'Add Assignment', onClick: () => navigate('/tutor-assignment', { state: { id: class_id } }) },
                        { icon: faBullhorn, label: 'All Announcements', onClick: () => navigate('/tutor-announcement', { state: { id: class_id } }) },
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
