import { useLocation } from "react-router-dom"
import DiscussionCard from "../components/DiscussionCard";
import { useEffect,useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import TutorReplyCard from "../components/TutorReplyCard";


export default function DoubtDiscussionPageTutor() {
    const location = useLocation();
    const class_id = location.state.class_id;
    const doubt_id = location.state.doubt_id;
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
    const [doubt, setDoubt] = useState({});
    const [student, setStudent] = useState('');
    const [comments, setComments] = useState('');
    const [discussions, setDiscussions] = useState([]);
    const [replies, setReplies] = useState([]);
    useEffect(() => {
        axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/doubt/${doubt_id}`, config)
        .then((response) => {
            setDoubt(response.data.doubt);
            setStudent(response.data.student.rows[0].first_name+" " + response.data.student.rows[0].last_name);
        })
        .catch((error) => {
            console.log(error);
        });

        axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/doubt/${doubt_id}/discussions`, config)
        .then((response) => {
            setDiscussions(response.data.discussions);
        })
        .catch((error) => {
            console.log(error);
        });

        axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/doubt/${doubt_id}/replies`, config)
        .then((response) => {
            setReplies(response.data.replies);
        })
        .catch((error) => {
            console.log(error);
        });
    }, [class_id, doubt_id]);

    const replyData = {
        reply: comments
    }

    async function submitReply() {
        if(comments === '') {
            toast.error('Comment cannot be empty');
            return;
        }
        await axios.post(`http://localhost:3000/api/v1/tutor/class/${class_id}/doubt/${doubt_id}/reply`, replyData, config)
        .then((response) => {
            toast.success('Reply Submitted Successfully');
            console.log(response);
        })
        .catch((error) => {
            toast.error('Failed to submit reply');
        });
    }


    return (
        <div className="text-white mx-auto py-8 px-4 md:px-6 bg-[#03040e]">
        <ToastContainer />
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{doubt.title}</h1>
        <p className="text-gray-500 ">
          {doubt.description}.
        </p>
        <p>Doubt Created by <span className="text-blue-800">{student.toLowerCase()}</span></p>
      </div>
      {replies.map((reply) => (
            <TutorReplyCard key={reply.id} reply={reply.reply} />
        ))}
      <div className="space-y-4">
      {discussions && discussions.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}

      </div>
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-2">Solve the doubt</h2>
        <div className="flex items-center">
          <textarea
            className="flex-1 rounded-l-lg border-r-0 border-gray-200 bg-gray-800 p-1 rounded-md   "
            placeholder="Write your comment here..." onChange={(e) => setComments(e.target.value)}
          />
          <button className="rounded-r-lg" onClick={submitReply}>Submit</button>
        </div>
      </div>
    </div>
    )
}