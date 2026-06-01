import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import Assignment from '../components/Assignment';
import { API_URL, getAuthConfig } from '../api';

export default function TutorAssignment() {
    const location = useLocation();
    const class_id = location.state?.id;

    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentDescription, setAssignmentDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [link, setLink] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);

    function fetchAssignments() {
        const config = getAuthConfig();
        axios.get(`${API_URL}/tutor/class/${class_id}/assignments`, config)
            .then((response) => {
                setAssignments(response.data.assignments || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        fetchAssignments();
    }, [class_id]);

    function postAssignment(e) {
        e.preventDefault();
        if (!assignmentTitle || !assignmentDescription || !dueDate) {
            toast.error('Title, description, and due date are required');
            return;
        }
        const config = getAuthConfig();
        axios.post(`${API_URL}/tutor/class/${class_id}/createassignment`, {
            title: assignmentTitle,
            link,
            description: assignmentDescription,
            due_date: dueDate,
        }, config)
            .then(() => {
                toast.success('Assignment created successfully');
                setAssignmentTitle('');
                setAssignmentDescription('');
                setDueDate('');
                setLink('');
                fetchAssignments();
            })
            .catch(() => toast.error('Failed to create assignment'));
    }

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-[#03040e] text-white min-h-screen p-6">
            <ToastContainer />
            <div className="bg-gray-800 p-6 rounded-lg mx-4">
                <div className="text-2xl font-bold mb-6">Assignments</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-bold mb-4">Create New Assignment</h2>
                        <form className="space-y-4" onSubmit={postAssignment}>
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={assignmentTitle}
                                    onChange={(e) => setAssignmentTitle(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Assignment title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    value={assignmentDescription}
                                    onChange={(e) => setAssignmentDescription(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Assignment description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Link (optional)</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-red-400 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Create Assignment
                            </button>
                        </form>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-4">All Assignments</h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {assignments.length === 0 ? (
                                <p className="text-gray-400 text-sm">No assignments yet.</p>
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
            </div>
        </div>
    );
}
