import Resource from "../components/Resource"
import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation } from 'react-router-dom'
import { ToastContainer } from "react-toastify"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function StudentResources() {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const class_id = (location.state || {}).id;
    const [resources, setResources] = useState([]);

    useEffect(() => {
        const config = getAuthConfig();
        axios.get(`${API_URL}/student/class/${class_id}/resources`, config)
            .then((response) => {
                setResources(response.data.resources || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [class_id]);

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen">
            <ToastContainer />
            <div className="container mx-auto py-6 px-4">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Resources</h1>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-3 max-h-[500px] overflow-y-auto">
                        {resources.length === 0 ? (
                            <p className="text-gray-400 text-sm">No resources available yet.</p>
                        ) : (
                            resources.map((resource, index) => (
                                <Resource key={index} title={resource.title} link={resource.link} type={resource.type} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
