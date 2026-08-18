import { useState } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import { API_URL, getAuthConfig } from '../api'

export default function JoinClass({ onJoined }) {
    const [classcode, setClasscode] = useState('');

    function joinClass() {
        if (!classcode.trim()) {
            toast.error('Please enter a class code');
            return;
        }
        const config = getAuthConfig();
        axios.post(`${API_URL}/student/enroll`, { classcode }, config)
            .then(() => {
                toast.success('Class joined successfully!');
                setClasscode('');
                if (onJoined) onJoined();
            })
            .catch((err) => {
                const msg = err.response?.data?.message;
                if (msg === "Cannot enroll student in class") {
                    toast.warn("Already enrolled or class does not exist");
                } else {
                    toast.error("Invalid class code");
                }
            });
    }

    return (
        <div className="w-80">
            <ToastContainer />
            <div className="text-xl font-bold mb-5 text-center">Join a Class</div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Class Code</label>
                    <input
                        type="text"
                        className="w-full bg-gray-700 text-white p-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="Paste class code here"
                        value={classcode}
                        onChange={(e) => setClasscode(e.target.value)}
                    />
                </div>
                <button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                    onClick={joinClass}
                >
                    Join Class
                </button>
            </div>
        </div>
    );
}
