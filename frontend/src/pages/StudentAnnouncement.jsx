import Announcement from "../components/Announcement"
import { useLocation } from "react-router-dom"
import { useState } from "react"
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import Spinner from "../components/Spinner";

export default function StudentAnnouncement(){
  const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    const class_id = (location.state || {}).id;

    const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

  const [announcements, setAnnouncements] = useState([]);


  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/student/class/${class_id}/announcements`,config)
    .then((response)=>{
      setAnnouncements(response.data.announcements);
    }).catch((error)=>{
      console.error('Cannot extract announcements for class', error);
    })
    setIsLoading(false);
  }, []);
    return (
        isLoading? <Spinner /> :
      <div className="bg-[#03040e] text-white h-screen p-10 ">
        <div className="bg-gray-800 p-6 rounded-lg mx-4 pt-10 ">
        <div className="font-bold text-xl">
                    <div className="pb-4">All Announcements</div>
                    <div className="bg-[#d9e6f7] rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        {[...announcements].reverse().map((announcementd) => {
                      const { id, title } = announcementd;
                      return (
                        <Announcement
                          key={id}
                          title={title}
                          date={'date'}
                        />
                      );
                    })} 
                    </div>
                </div>
        </div>
    </div>
    )
}