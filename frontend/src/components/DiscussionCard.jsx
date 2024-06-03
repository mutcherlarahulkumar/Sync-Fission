
import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';


export default function DiscussionCard({discussion}) {
    const student_id = discussion.student_id;

    // console.log(discussion);
    const [student,setStudent] = useState('');
    const config = {
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
  };


    useEffect(() => {
        axios.get(`http://localhost:3000/api/v1/student/name`, config)
        .then((response) => {
            setStudent(response.data.student.first_name + " " + response.data.student.last_name);
        })
        .catch((error) => {
            console.log(error);
        });
    }, [student_id]);



    return <div className="bg-gray-800  rounded-lg shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-medium">{discussion.reply}</h2>
      <span className="bg-gray-100  text-gray-500  px-2 py-1 rounded-full text-xs">
        12 replies
      </span>
    </div>
    <p className="text-gray-500  line-clamp-2">
      Posted by {student}
    </p>
  </div>
}