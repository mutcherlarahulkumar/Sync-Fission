import ClassCard from "../components/ClassCard"
import Popup from "../components/Popup"
import JoinClass from "../components/JoinClass"
import { useEffect, useState } from "react"
import axios from "axios"
import Spinner from "../components/Spinner"


export default function StudentDashboard() {


  const [isLoading, setIsLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [classes, setClasses] = useState([]);

    const [studentName , setStudentName] = useState(''); 

    useEffect(() => {
        const token = localStorage.getItem('token'); // replace 'token' with the key you used to store the token
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
    
        axios.get('http://localhost:3000/api/v1/student/classes', config)
          .then((response) => {
            setClasses(response.data.classes);
          })
          .catch((error) => {
            console.log(error);
          });

          axios.get('http://localhost:3000/api/v1/student/name', config)
          .then((response)=>{
            setStudentName(response.data.student.first_name + " "+ response.data.student.last_name);
          }).catch((error)=>{
            console.log(error)
          })

          setIsLoading(false);
      }, []);

      const nothing = `No classes Joined yet. Click on "Join Class" to Join a new class.`
    return (
        isLoading ? <Spinner /> :
        <div className="bg-[#03040e] text-white p-5">
            <div className="bg-gray-800 rounded-lg  mx-4 p-8 h-screen">
                <div className=" flex justify-between pb-10">
                    <div className="text-white font-bold text-2xl">Welcome Student <span className="text-blue-500 font-mono">{studentName}</span></div>
                    <div className="hover:cursor-pointer hover:underline font-semibold hover:text-blue-300" onClick={()=>{setShow(true)}}>Join Class</div>
                    <Popup children={<JoinClass />} show={show} close={() => {setShow(false)}} />
                </div>
                <div className="text-2xl pb-5 font-semibold">All Joined Classes</div>
                <div className="text-red-300 font-bold text-3xl w-100 flex justify-center mt-12 pt-12">{classes.length===0?nothing:""}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem, index) => (
  <ClassCard 
    key={index} 
    id={classItem.id} 
    name={classItem.name} 
    description={classItem.description} 
    user = "student"
  />
))}
                </div>
            </div>
        </div>
    )
}