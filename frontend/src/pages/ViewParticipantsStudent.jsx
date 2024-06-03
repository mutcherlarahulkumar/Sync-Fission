import axios from "axios"
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import StudentProfile from "../components/StudentProfile"
import { useEffect, useState } from "react"
import TeacherProfile from "../components/TeacherProfile"
import Spinner from "../components/Spinner"

export default function ViewParticiapantsStudent(){

    const [students,setStudents] = useState([]);
    const [tutor,setTutor] = useState({});

    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

  const class_id = (location.state || {}).id;

    const reqdata = {
        class_id: class_id
    }

    useEffect(()=>{
        axios.post("http://localhost:3000/api/v1/student/class/students",reqdata,config)
        .then((response) => {
            setStudents(response.data.students);
            console.log(response.data);
            setTutor(response.data.tutor);
          })
          .catch((error) => {
            console.log(error);
          });

            
          {setIsLoading(false )}
    },[class_id]);




    return isLoading ? <Spinner /> :
     <div className="bg-[#03040e] text-white h-screen p-10 ">
        <div className="bg-gray-800 p-6 rounded-lg mx-4 pt-10 ">
        <div className="font-bold text-xl">
            <div  >
            <div className="pb-4">Tutor </div>
            <div className="bg-red-300 rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
            <TeacherProfile name={`${tutor.first_name} ${tutor.last_name}`} />
            </div>
            </div>
                    <div className="pb-4">All Participants</div>
                    <div className="bg-[#d9e6f7] rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        {students.map((student, index) => (
                            <StudentProfile 
                                key={index} 
                                name={`${student.first_name} ${student.last_name}`} 
                                email={student.email} 
                            />
                            ))}
                    </div>
                </div>
            </div>
        </div>
}