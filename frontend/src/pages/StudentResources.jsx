import Resource from "../components/Resource";
import { useState } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import Spinner from "../components/Spinner";

export default function StudentResources(){
  const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
  const location = useLocation();
  const class_id = (location.state || {}).id;

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const [resources, setResources] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/resources`, config)
      .then((response) => {
        setResources(response.data.resources);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
      setIsLoading(false);
  }
  , [class_id]);

    return (
    isLoading? <Spinner /> :
    <div>
    <ToastContainer />
         <div className="min-h-screen bg-[#03040e] text-white">
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Resources</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-2">
                <h2 className="text-xl font-bold mb-4">Latest Resources</h2>
                <div className="bg-[#d9e6f7] rounded-lg p-4 space-y-4 max-h-[300px] overflow-y-auto">
                {resources.map((resource, index) => (
                  <Resource 
                    key={index} 
                    title={resource.title} 
                    link={resource.link} 
                    type={resource.type} 
                  />
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    </div>)
}