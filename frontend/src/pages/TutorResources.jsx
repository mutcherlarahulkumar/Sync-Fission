import Resource from "../components/Resource";
import { useState } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";

export default function TutorResources(){
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('');
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
  }
  , [class_id]);

    return <div>
    <ToastContainer />
         <div className="min-h-screen bg-[#03040e] text-white">
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Resources</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Add a Resource</h2>
                <div className="bg-[#d9e6f7] rounded-lg p-4">
                  <form className="space-y-4 text-black">
                    <div>
                      <label className="text-sm font-medium" htmlFor="title">
                        Title
                      </label>
                      <input type="text" 
                        className=" text-black w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter the title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="link">
                        Link
                      </label>
                      <input type="text"
                        className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Enter the link"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="title">
                        Type
                      </label>
                      <input type="text" 
                        className=" text-black w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => setType(e.target.value)}
                        placeholder="Enter the type of resource"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[#8c9bab] text-sm">Added</div>
                      <button type="submit" className="bg-blue-300 rounded text-white p-1" onClick={(e)=>{
                        e.preventDefault();
                        const resourcedata = {
                          title: title,
                          link: link,
                          type: type
                        }
                        axios.post(`http://localhost:3000/api/v1/tutor/class/${class_id}/addresource`,resourcedata,config)
                        .then((response) => {
                          toast.success('Resource added successfully');
                        }).catch((error) => {
                          toast.error('Error adding resource');
                        });
                      }}>
                        Add Resource
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
    </div>
}