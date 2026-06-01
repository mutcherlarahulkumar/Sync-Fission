import axios from "axios"
import { useLocation } from "react-router-dom"
import StudentProfile from "../components/StudentProfile"
import { useEffect, useState } from "react"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function ViewParticipants() {
    const [students, setStudents] = useState([]);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const class_id = (location.state || {}).id;

    useEffect(() => {
        const config = getAuthConfig();
        axios.post(`${API_URL}/tutor/class/students`, { class_id }, config)
            .then((response) => {
                setStudents(response.data.students || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [class_id]);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen p-6">
            <div className="bg-gray-800 p-6 rounded-lg mx-4">
                <div className="text-2xl font-bold mb-6">All Participants</div>
                {students.length === 0 ? (
                    <p className="text-gray-400 text-sm">No students enrolled yet.</p>
                ) : (
                    <div className="bg-gray-700 rounded-lg p-4 space-y-3 max-h-[500px] overflow-y-auto">
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
    );
}
