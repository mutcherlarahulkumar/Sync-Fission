import axios from "axios"
import { useLocation } from "react-router-dom"
import StudentProfile from "../components/StudentProfile"
import { useEffect, useState } from "react"
import TeacherProfile from "../components/TeacherProfile"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function ViewParticipantsStudent() {
    const [students, setStudents] = useState([]);
    const [tutor, setTutor] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const class_id = (location.state || {}).id;

    useEffect(() => {
        const config = getAuthConfig();
        axios.post(`${API_URL}/student/class/students`, { class_id }, config)
            .then((response) => {
                setStudents(response.data.students || []);
                setTutor(response.data.tutor || {});
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [class_id]);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen p-6">
            <div className="bg-gray-800 p-6 rounded-lg mx-4 space-y-6">
                <div className="text-2xl font-bold">Participants</div>
                <div>
                    <div className="text-base font-semibold mb-3">Tutor</div>
                    <div className="bg-gray-700 rounded-lg p-4">
                        {tutor.first_name ? (
                            <TeacherProfile name={`${tutor.first_name} ${tutor.last_name}`} />
                        ) : (
                            <p className="text-gray-400 text-sm">No tutor info available.</p>
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-base font-semibold mb-3">Students</div>
                    {students.length === 0 ? (
                        <p className="text-gray-400 text-sm">No other students enrolled.</p>
                    ) : (
                        <div className="bg-gray-700 rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {students.map((student, index) => (
                                <StudentProfile
                                    key={index}
                                    name={`${student.first_name} ${student.last_name}`}
                                    email={student.email}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
