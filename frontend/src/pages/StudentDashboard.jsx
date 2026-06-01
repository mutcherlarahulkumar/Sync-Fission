import ClassCard from "../components/ClassCard"
import Popup from "../components/Popup"
import JoinClass from "../components/JoinClass"
import { useEffect, useState } from "react"
import axios from "axios"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function StudentDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [classes, setClasses] = useState([]);
    const [studentName, setStudentName] = useState('');

    function fetchClasses() {
        const config = getAuthConfig();
        axios.get(`${API_URL}/student/classes`, config)
            .then((response) => {
                setClasses(response.data.classes || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    }

    useEffect(() => {
        const config = getAuthConfig();
        fetchClasses();
        axios.get(`${API_URL}/student/name`, config)
            .then((response) => {
                const s = response.data.student;
                setStudentName(s.first_name + " " + s.last_name);
            })
            .catch(console.error);
    }, []);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white p-5 min-h-screen">
            <div className="bg-gray-800 rounded-lg mx-4 p-8">
                <div className="flex justify-between items-center pb-8">
                    <div className="text-white font-bold text-2xl">
                        Welcome,{' '}
                        <span className="text-blue-400 font-mono">{studentName}</span>
                    </div>
                    <button
                        className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        onClick={() => setShow(true)}
                    >
                        + Join Class
                    </button>
                    <Popup show={show} close={() => setShow(false)}>
                        <JoinClass onJoined={fetchClasses} />
                    </Popup>
                </div>
                <div className="text-xl pb-5 font-semibold">Your Classes</div>
                {classes.length === 0 ? (
                    <div className="text-gray-400 text-center py-16">
                        No classes joined yet. Click <strong>"+ Join Class"</strong> and enter a class code.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((classItem) => (
                            <ClassCard
                                key={classItem.id}
                                id={classItem.id}
                                name={classItem.name}
                                description={classItem.description}
                                user="student"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
