import Announcement from "../components/Announcement"
import { useLocation } from "react-router-dom"
import { useState } from "react"
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import Spinner from "../components/Spinner";

export default function TutorAnnouncement(){
    const location = useLocation();
    const class_id = location.state.id;
    const [announcement, setAnnouncement] = useState('');

    const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

  const [announcements, setAnnouncements] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/announcements`,config)
    .then((response)=>{
      setAnnouncements(response.data.announcements);
    }).catch((error)=>{
      console.error('Cannot extract announcements for class', error);
    })
    setIsLoading(false);
  }, []);
  // console.log(announcements);


    function postannouncement(e){
      e.preventDefault();
      const announcementData = {
        title: announcement,
        description: 'Your announcement description'
      };
      axios.post(`http://localhost:3000/api/v1/tutor/class/${class_id}/addannouncement`,announcementData,config)
      .then((response)=>{
        console.log(response.data);
    toast.success('Announcement added successfully');
      })
      .catch((error)=>{
        console.error('Cannot add new announcement for class', error);
        toast.error('Cannot add new announcement for class');
      })
    }
    return (
      isLoading ? <Spinner /> :
        <div className="bg-[#03040e] text-white h-screen p-10 ">
        <ToastContainer />
        <div className="bg-gray-800 p-6 rounded-lg mx-4 pt-10 ">
            <div className="text-2xl font-bold">Classroom ~ Announcement</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 ">
                <div className="font-bold text-lg">
                    <div>
              <h2 className="text-xl font-bold mb-4">Create New Announcement</h2>
              <div className="bg-[#d9e6f7] rounded-lg p-4 text-black">
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="announcement">
                      Announcement
                    </label>
                    <textarea className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      id="announcement"
                      placeholder="Enter your announcement" onChange={(e)=>{setAnnouncement(e.target.value)}} ></textarea>
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="submit" className="bg-blue-400 rounded p-1" onClick={postannouncement}>
                      Post Announcement
                    </button>
                  </div>
                </form>
              </div>
            </div>
                </div>
                <div className="font-bold text-xl">
                    <div>All Announcements</div>
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
    </div>
    )
}