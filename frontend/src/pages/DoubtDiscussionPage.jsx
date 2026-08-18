import { useLocation } from "react-router-dom"
import DiscussionCard from "../components/DiscussionCard"
import { useEffect, useState } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import TutorReplyCard from "../components/TutorReplyCard"
import Spinner from "../components/Spinner"
import { API_URL, getAuthConfig } from '../api'

export default function DoubtDiscussionPage() {
    const location = useLocation();
    const class_id = location.state?.class_id;
    const doubt_id = location.state?.doubt_id;

    const [doubt, setDoubt] = useState({});
    const [student, setStudent] = useState('');
    const [comment, setComment] = useState('');
    const [discussions, setDiscussions] = useState([]);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    function fetchData() {
        const config = getAuthConfig();
        Promise.all([
            axios.get(`${API_URL}/student/class/${class_id}/doubt/${doubt_id}`, config),
            axios.get(`${API_URL}/student/class/${class_id}/doubt/${doubt_id}/discussions`, config),
            axios.get(`${API_URL}/student/class/${class_id}/doubt/${doubt_id}/replies`, config),
        ])
            .then(([doubtRes, discussionsRes, repliesRes]) => {
                setDoubt(doubtRes.data.doubt || {});
                const s = doubtRes.data.student;
                if (s) setStudent(s.first_name + " " + s.last_name);
                setDiscussions(discussionsRes.data.discussions || []);
                setReplies(repliesRes.data.replies || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchData();
    }, [class_id, doubt_id]);

    function postComment() {
        if (!comment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }
        const config = getAuthConfig();
        axios.post(`${API_URL}/student/class/${class_id}/doubt/${doubt_id}/discuss`, { reply: comment }, config)
            .then(() => {
                toast.success("Comment posted");
                setComment('');
                fetchData();
            })
            .catch(() => toast.error("Failed to post comment"));
    }

    if (loading) return <Spinner />;

    return (
        <div className="text-white mx-auto py-8 px-4 md:px-6 bg-[#03040e] min-h-screen">
            <ToastContainer />
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">{doubt.title}</h1>
                    <p className="text-gray-400">{doubt.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Posted by <span className="text-blue-400">{student}</span>
                    </p>
                </div>

                {replies.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Tutor&apos;s Answer</h2>
                        {replies.map((reply) => (
                            <TutorReplyCard key={reply.id} reply={reply.reply} />
                        ))}
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    <h2 className="text-lg font-semibold">Discussion</h2>
                    {discussions.length === 0 ? (
                        <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
                    ) : (
                        discussions.map((d) => <DiscussionCard key={d.id} discussion={d} />)
                    )}
                </div>

                <div className="mt-6">
                    <h2 className="text-base font-medium mb-2">Add a comment</h2>
                    <div className="flex gap-2">
                        <textarea
                            className="flex-1 rounded-lg bg-gray-800 border border-gray-600 p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-20"
                            placeholder="Write your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium self-start transition-colors"
                            onClick={postComment}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
