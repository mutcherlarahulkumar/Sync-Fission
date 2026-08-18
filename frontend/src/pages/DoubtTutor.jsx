import { useEffect, useState } from 'react';
import axios from 'axios';
import DoubtCardTutor from '../components/DoubtCardTutor';
import { useLocation } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { API_URL, getAuthConfig } from '../api';

export default function DoubtTutor() {
    const location = useLocation();
    const class_id = location.state?.id;
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const config = getAuthConfig();
        axios.get(`${API_URL}/tutor/class/${class_id}/doubts`, config)
            .then((res) => {
                setDoubts(res.data.doubts || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [class_id]);

    if (loading) return <Spinner />;

    return (
        <div className="bg-[#03040e] min-h-screen p-6">
            <div className="bg-gray-800 rounded-lg p-6 mx-4">
                <h3 className="text-2xl font-bold text-white mb-6">Student Doubts</h3>
                {doubts.length === 0 ? (
                    <p className="text-gray-400 text-sm">No doubts submitted yet.</p>
                ) : (
                    <div className="space-y-3">
                        {doubts.map((doubt) => (
                            <DoubtCardTutor
                                key={doubt.id}
                                title={doubt.title}
                                description={doubt.description}
                                class_id={class_id}
                                doubt_id={doubt.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
