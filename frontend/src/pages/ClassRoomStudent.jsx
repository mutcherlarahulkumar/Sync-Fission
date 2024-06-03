import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload as DownloadIcon } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots as MessageCircleIcon } from '@fortawesome/free-solid-svg-icons';
import { faUsers as GroupChatIcon } from '@fortawesome/free-solid-svg-icons';
import { faUsers as UsersIcon } from '@fortawesome/free-solid-svg-icons';
import { faFile as FileIcon } from '@fortawesome/free-solid-svg-icons';
import { faChalkboardTeacher as ClassroomIcon } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';


export default function ClassRoomStudent(){

  const navigate = useNavigate();
  const location = useLocation();
  const class_id = (location.state || {}).id;

  const [classInfo, setClassInfo] = useState({});
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  



  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/student/class/${class_id}`, config)
      .then((response) => {
        setClassInfo(response.data.classInfo);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [class_id]);




    return <div className="bg-[#03040e] text-white h-screen">
    <div className="bg-gray-800 p-6 rounded-lg mx-4">
        <div className="text-2xl font-bold">Classroom name : <span className="text-blue-500 font-mono">{classInfo.name}</span></div>
        <div className='flex justify-between p-4'>
            <div>Class Description : {classInfo.description}</div>
            <div>No of Students : {classInfo.students}</div>
        </div>
        <div className='flex justify-between p-4'>
            <div>Book References : {classInfo.book_ref}</div>
            <div>Prerequsites : {classInfo.prereqs}</div>
        </div>
        <div className="">
            <div className="">
                <div className="text-lg pb-4">Latest Announcement</div>
                <div className="bg-[#95bdf3] rounded-lg p-4">
                    <p className="text-red-500">New Assignment due next week</p>
                    <p className="text-gray-600 text-sm">Posted 2 days ago</p>
                </div>
            </div>
        </div>
        <div className="text-2xl font-bold mt-9 mb-12">Classroom Options</div>
        <div className="grid grid-cols-3 gap-6 text-black pb-12">
                <button className="bg-[#d9e6f7] flex items-center justify-center p-4" variant="outline" onClick={()=>{
                  navigate('/student-announcement', {state: {id: class_id}})
                }}>
                <FontAwesomeIcon icon={ClassroomIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">View Announcements</span>
                </button>
                <button className="bg-[#d9e6f7] flex items-center justify-center p-4" variant="outline" onClick={()=>{
                  navigate('/student-resources', {state: {id: class_id}})
                }}>
                  <FontAwesomeIcon icon={DownloadIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">View Resources</span>
                </button>
                <button className="bg-[#d9e6f7] flex items-center justify-center p-4" variant="outline" onClick={()=>{
                  navigate('/doubt-student', {state: {id: class_id}})
                }}>
                  <FontAwesomeIcon icon={MessageCircleIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Ask Doubts</span>
                </button>
                <button className="bg-[#d9e6f7] flex items-center justify-center p-4" variant="outline" onClick={()=>{
                  navigate('/view-participants-student', {state: {id: class_id}})
                }}>
                <FontAwesomeIcon icon={UsersIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">View Participants</span>
                </button>
                <button className="bg-[#d9e6f7] flex items-center justify-center p-4" variant="outline">
                <FontAwesomeIcon icon={GroupChatIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Join Group Chat</span>
                </button>
                <button className="bg-[#d9e6f7] flex items-center justify-center p-4" variant="outline" onClick={()=>{
                  navigate('/student-assignment', {state: {id: class_id}})
                }}>
                <FontAwesomeIcon icon={FileIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">View Assignments</span>
                </button>
          </div>
    </div>
</div>
}