import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus as PlusIcon } from '@fortawesome/free-solid-svg-icons';
import { faUpload as UploadIcon } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots as MessageCircleIcon } from '@fortawesome/free-solid-svg-icons';
import { faUsers as GroupChatIcon } from '@fortawesome/free-solid-svg-icons';
import { faFileUpload as FilePlusIcon } from '@fortawesome/free-solid-svg-icons';
import { faEdit as EditIcon } from '@fortawesome/free-solid-svg-icons';
import { faUserFriends as AllParticipantsIcon } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


 

export default function ClassRoomTutor(){
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const class_id = (location.state || {}).id;

  const [classInfo, setClassInfo] = useState({});
  const [classCode, setClassCode] = useState('');
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  



  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}`, config)
      .then((response) => {
        setClassInfo(response.data.classInfo);
        setClassCode(response.data.classcode);
      })
      .catch((error) => {
        console.log(error);
      });
      setIsLoading(false);
  }, [class_id]);

  const addAnnouncement = () => {
    navigate('/tutor-announcement', { state: { id: class_id } }); 
  }

  const addResource = () => {
    navigate('/tutor-resources', { state: { id: class_id } });
  }


    return <div className="bg-[#03040e] text-white h-full">
    <ToastContainer />
        <div className="bg-gray-800 p-6 rounded-lg mx-4">
            <div className="text-2xl font-bold">Class Name : <span className="text-blue-500 font-mono">{classInfo.name}</span></div>
            <div className='flex justify-between p-4'>
                <div>Class Description : {classInfo.description}</div>
                <div>No. of Students : {classInfo.students}</div>
            </div>
            <div className='flex justify-between p-4'>
                <div>Book References : {classInfo.book_ref}</div>
                <div>Prerequsites : {classInfo.prereqs}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 ">
                <div className="">
                    <div className="text-lg pb-4">Latest Announcement</div>
                    <div className="bg-[#95bdf3] rounded-lg p-4">
                        <p className="text-red-500">New Assignment due next week</p>
                        <p className="text-gray-600 text-sm">Posted 2 days ago</p>
                    </div>
                </div>
                <div>
                    <div className="text-lg pb-4">Class Code :</div>
                    <div className="bg-[#95bdf3] rounded-lg p-5 text-gray-800">
                        <div className="flex justify-between items-center">
                            <div className="font-semibold">Class Code :{classCode.substring(0,20)}...</div>
                            <div className="bg-gray-800 text-white rounded-lg p-1.5"><button onClick={()=>{navigator.clipboard.writeText
                (classCode);
                toast.success("Class Code Copied !")}}>Copy</button></div>
                        </div>  
                    </div>
                </div>
            </div>
            <div className="text-2xl font-bold mt-9 mb-12">Classroom Options</div>
            <div className="grid grid-cols-3 gap-6 text-black pb-12">
                <button onClick={addAnnouncement} className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline">
                  <FontAwesomeIcon icon={PlusIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Add Announcement</span>
                </button>

                <button className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline" onClick={addResource}>
                  <FontAwesomeIcon icon={UploadIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Add Resources</span>
                </button>

                <button className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline" onClick={()=>{
                  navigate('/doubt-tutor', { state: { id: class_id } });
                }}>
                    <FontAwesomeIcon icon={MessageCircleIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Solve Doubts</span>
                </button>

                <button className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline" onClick={()=>{navigate('/view-participants', { state: { id: class_id } })}}>
                    <FontAwesomeIcon icon={AllParticipantsIcon} className="w-4 h-4 mr-2" />

                  <span className="text-sm font-medium">All Participants</span>
                </button>

                <button className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline">
                    <FontAwesomeIcon icon={GroupChatIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Group Chat</span>
                </button> 

                <button className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline" onClick={()=>{
                  navigate('/tutor-assignment', { state: { id: class_id } });
                }}>
                  <FontAwesomeIcon icon={FilePlusIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Add Assignment</span>
                </button>

                <button className="bg-[#d9e6f7] flex items-center justify-center p-4 rounded-md" variant="outline">
                  <FontAwesomeIcon icon={EditIcon} className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Edit Classroom</span>
                </button>
                
              </div>
        </div>
    </div>
}