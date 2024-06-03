import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import Assignment from '../components/Assignment';



export default function TutorAssignment(){
    const location = useLocation();
    const class_id = location.state.id;
    const [assignmentTitle, setassignmentTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [link,setLink] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [assignmentDescription, setAssignmentDescription] = useState('');
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    useEffect(() => {
      axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/assignments`,config)
      .then((response)=>{
        setAssignments(response.data.assignments);
      }).catch((error)=>{
        console.error('Cannot extract assignments for class', error);
      })
      setIsLoading(false);
    }, [class_id]);


    function postassignment(e){
      e.preventDefault();
      const assignmentData = {
        title: assignmentTitle,
        link: link,
        description: assignmentDescription,
        due_date: dueDate
        
      }
      
      axios.post(`http://localhost:3000/api/v1/tutor/class/${class_id}/createassignment`,assignmentData,config)
      .then((response)=>{
        console.log(response.data);
    toast.success('Assignment added successfully');
      })
      .catch((error)=>{
        console.error('Cannot add new assignment for class', error);
        toast.error('Cannot add new assignment for class');
      })
    }
    return (
      isLoading ? <Spinner /> :
        <div className="bg-[#03040e] text-white h-full p-10 ">
        <ToastContainer />
        <div className="bg-gray-800 p-6 rounded-lg mx-4 pt-10">
            <div className="text-2xl font-bold">Classroom ~ Assignment</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 ">
                <div className="font-bold text-lg">
                    <div>
              <h2 className="text-xl font-bold mb-4">Create New Assignment</h2>
              <form onSubmit={postassignment}>
                  <div className="mb-4">
                      <label  className="block text-sm font-medium ">Assignment Title</label>
                      <input type="text"  onChange={(e)=>setassignmentTitle(e.target.value)} className="mt-1 p-2 rounded-lg w-full bg-gray-800 text-white border" />
                    </div>
                    <div className="mb-4">
                      <label  className="block text-sm font-medium ">Assignment Description</label>
                      <input type="text"  onChange={(e)=>setAssignmentDescription(e.target.value)} className="mt-1 p-2 rounded-lg w-full bg-gray-800 text-white border" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="file" className="block text-sm font-medium ">Link</label>
                      <input type="text" name="file" id="file" onChange={(e)=>setLink(e.target.value)} className="mt-1 p-2 rounded-lg w-full bg-gray-800 text-white border" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="due_date" className="block text-sm font-medium ">Due Date</label>
                      <input type="date" name="due_date" id="due_date"  onChange={(e)=>setDueDate(e.target.value)} className="mt-1 p-2 rounded-lg w-full bg-gray-800 text-red-400 border " />  
                    </div>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg">Add Assignment</button>
                </form>
                </div>
              {/* need to implement how many assignments are there and how many are completed */}
                <div className="font-bold text-lg mt-6">
                    <div>
                <h2 className="text-2xl font-bold mb-4">All Assignments</h2>
                <div className=" rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {/* <Assignement key={'1'} title={'title'} description={'description'} date={'date'} link={'link'} /> */}
                    {[...assignments].reverse().map((assignment) => {
                  const { id, title,link,description,due_date } = assignment;
                  const dueDatefull = new Date(due_date).toLocaleDateString();
                  return (
                    <Assignment
                      key={id}
                      title={title}
                      description={description}
                      date={dueDatefull}
                      link={link}
                    />
                  );
                })}
                </div>
                </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    )
}
