import {useState} from "react"
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
export default function JoinClass() {

    const [classcode, setClasscode] = useState('');
    const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const postdata = {
            classcode:classcode
        }
    return (
        <div>
        <ToastContainer />
            <div className="text-2xl pb-5 font-semibold text-center">Join Class</div>
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="class-code" className="text-lg">Enter Class Code</label>
                    <input type="text" id="class-code" className="bg-gray-800 text-white p-2 rounded-lg border border-white pl-5 ml-4 " onChange={(e)=>{setClasscode(e.target.value)}}/>
                </div>
                <div>
                    <button className="bg-blue-500 text-white p-2 rounded-lg" onClick={()=>{
                        axios.post("http://localhost:3000/api/v1/student/enroll",postdata,config)
                        .then((res)=>{
                            if(res.data.message === "Cannot enroll student in class"){
                                toast.warn("Already Enrolled / No Class Exists");
                            }
                            else{
                            toast.success("Class Joined Successfully");

                            }
                        })
                        .catch((err)=>{
                            console.log(err);
                            toast.error("Invalid Class Code");
                        })

                    }}>Join Class</button>
                </div>
            </div>
        </div>
    )
}