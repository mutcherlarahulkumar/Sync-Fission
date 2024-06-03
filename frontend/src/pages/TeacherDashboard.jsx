import ClassCard from "../components/ClassCard"
import Popup from "../components/Popup"
import CreateClass from "../components/CreateClass";
import { useState } from "react"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import axios from 'axios';
import Spinner from "../components/Spinner";


export default function TeacherDashboard() {


  const [isLoading, setIsLoading] = useState(true);



    const [show, setShow] = useState(false);

    const [classes, setClasses] = useState([]);

    const [tutorName, settutorName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token'); // replace 'token' with the key you used to store the token
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
    
        axios.get('http://localhost:3000/api/v1/tutor/classes', config)
          .then((response) => {
            setClasses(response.data.classes);
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
          axios.get('http://localhost:3000/api/v1/tutor/name', config)
          .then((response) => {
            settutorName(response.data.tutor.rows[0].first_name+" "+response.data.tutor.rows[0].last_name);
          })
          .catch((error) => {
            console.log(error);
          });

      }, []);

      const nothing = `No classes created yet. Click on "Create Class" to create a new class.`
    
    return (
        isLoading ? <Spinner /> :
        <div className="bg-[#03040e] text-white p-5">
            <div className="bg-gray-800 rounded-lg  mx-4 p-8 h-screen">
                <div className=" flex justify-between pb-10">
                    <div className="text-white font-bold text-2xl">Welcome Tutor <span className="text-blue-500  underline font-mono">{tutorName}</span></div>
                    <div className="hover:cursor-pointer hover:underline font-semibold hover:text-blue-300" onClick={()=>{setShow(true)}}>Create Class</div>
                    <Popup children={<CreateClass setShow={setShow}/>} show={show} close={() => {setShow(false)}} />
                </div>
                <div className="text-2xl pb-5 font-semibold">All Created Classes</div>
                <div className="text-red-300 font-bold text-3xl w-100 flex justify-center pt-12 mt-12">{classes.length===0?nothing:""}</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassCard key={classItem.id} id={classItem.id} name={classItem.name} description={classItem.description} user={'tutor'} />
        ))}
      </div>
            </div>
        </div>
    )
}