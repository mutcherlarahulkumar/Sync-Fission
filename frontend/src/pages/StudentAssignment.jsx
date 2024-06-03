
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Assignment from '../components/Assignment';


export default function StudentAssignemt(){

    const location = useLocation();
    const class_id = location.state.id;
    const [assignments, setAssignments] = useState([]);
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    useEffect(() => {
        axios.get(`http://localhost:3000/api/v1/student/class/${class_id}/assignments`,config)
        .then((response)=>{
            setAssignments(response.data.assignments);
        }).catch((error)=>{
            console.error('Cannot extract assignments for class', error);
        })
        }
    , [class_id]);

    return (
        <div className="bg-[#03040e] text-white h-screen p-10">
            <div className="font-bold text-lg">
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
    )
}