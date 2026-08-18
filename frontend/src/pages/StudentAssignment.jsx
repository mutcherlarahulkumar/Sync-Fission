import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Assignment from '../components/Assignment';
import Spinner from '../components/Spinner';
import { API_URL, getAuthConfig } from '../api';

export default function StudentAssignment() {
    const location = useLocation();
    const class_id = location.state?.id;
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const config = getAuthConfig();
        axios.get(`${API_URL}/student/class/${class_id}/assignments`, config)
            .then((response) => {
                setAssignments(response.data.assignments || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [class_id]);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen p-6">
            <div className="bg-gray-800 p-6 rounded-lg mx-4">
                <h2 className="text-2xl font-bold mb-6">Assignments</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {assignments.length === 0 ? (
                        <p className="text-gray-400 text-sm">No assignments posted yet.</p>
                    ) : (
                        [...assignments].reverse().map((a) => (
                            <Assignment
                                key={a.id}
                                title={a.title}
                                description={a.description}
                                date={new Date(a.due_date).toLocaleDateString()}
                                link={a.link}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
