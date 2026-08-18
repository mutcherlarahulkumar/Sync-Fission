import Resource from "../components/Resource"
import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function TutorResources() {
    const location = useLocation();
    const class_id = (location.state || {}).id;

    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [type, setType] = useState('');
    // Pasted notes/summary. This is the text the assistant actually searches —
    // a bare link has nothing to embed.
    const [content, setContent] = useState('');
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    function fetchResources() {
        const config = getAuthConfig();
        axios.get(`${API_URL}/tutor/class/${class_id}/resources`, config)
            .then((response) => {
                setResources(response.data.resources || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        fetchResources();
    }, [class_id]);

    function addResource(e) {
        e.preventDefault();
        if (!title || !link) {
            toast.error('Title and link are required');
            return;
        }
        const config = getAuthConfig();
        axios.post(`${API_URL}/tutor/class/${class_id}/addresource`, { title, link, type, content }, config)
            .then(() => {
                toast.success('Resource added successfully');
                setTitle('');
                setLink('');
                setType('');
                setContent('');
                fetchResources();
            })
            .catch(() => toast.error('Failed to add resource'));
    }

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen">
            <ToastContainer />
            <div className="container mx-auto py-6 px-4">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Resources</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-bold mb-4">Add a Resource</h2>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <form className="space-y-4" onSubmit={addResource}>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Resource title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Link</label>
                                        <input
                                            type="url"
                                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            placeholder="e.g. PDF, Video, Article"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Notes <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            rows={5}
                                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Paste a summary or the key points. Anything you put here becomes searchable by the AI assistant."
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Students asking Devika about this topic will get answers grounded in these notes.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                    >
                                        Add Resource
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold mb-4">All Resources</h2>
                            <div className="bg-gray-700 rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
                                {resources.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No resources added yet.</p>
                                ) : (
                                    resources.map((resource, index) => (
                                        <Resource key={index} title={resource.title} link={resource.link} type={resource.type} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
