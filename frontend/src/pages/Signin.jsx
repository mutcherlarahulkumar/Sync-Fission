
import student from '../assets/students.jpg';
import tutor from '../assets/tutor.png';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signin(){
  const [isloading, setisLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state.role;
    const [user, setuser] = useState(role.toUpperCase());
    let personimage = user === 'STUDENT' ? student : tutor;
    function changeUser(){
        setuser(user === 'STUDENT' ? 'TUTOR' : 'STUDENT');
        personimage = user === 'STUDENT' ? tutor : student;
    }


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    function buttonClicked(e) {
      setisLoading(true);
        e.preventDefault();
        if (email === '' || password === '') {
          toast.error('All fields are required');
          return;
        }
        const signinUser = { email, password };
    
        axios.post(`http://localhost:3000/api/v1/signin/${user.toLowerCase()}`, signinUser)
          .then((response) => {
            console.log(response.data);
            localStorage.setItem("token",response.data.token);
            if (response.data.message) {
              toast.success(response.data.message);
              
              navigate(`/${user.toLowerCase()}-dashboard`);
            }
            if (response.data.error) {
                // If the response contains an error message, display it as an error notification
                toast.error(response.data.error);
              }
              setisLoading(false);
          })
          .catch((error) => {
            console.log(error.response.data);
            if (error.response.data.error) {
              toast.error(error.response.data.error);
            } else {
              toast.error('An error occurred');
            }
          });
      }



    return (
        (isloading) ? (<Spinner />) :
        <div className="bg-[#03040e] text-white h-full">
        <ToastContainer />
            <div className="flex h-full items-center ">
                <div className="w-1/2 pl-12 ml-3">
                    <div className="bg-gray-800 rounded-lg w-max p-10 ">
                    <div className="text-3xl font-bold mb-6">Sign In {user}</div>
                        <form className="max-w-sm mx-auto">
                        <div className="mb-5">
                            <label  className="block mb-2 text-sm font-medium text-white ">Your Email</label>
                            <input type="email"  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="yourname@gmail.com" onChange={(e)=>{setEmail(e.target.value)}} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-white ">Your password</label>
                            <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " onChange={(e)=>{setPassword(e.target.value)}} required />
                        </div>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center" onClick={buttonClicked}>Sign In</button>
                        </form>
                        <div className="pt-4 text-gray-400">Don't have an account? <button className="text-white hover:underline hover:cursor-pointer" onClick={()=>{
                            navigate('/signup',{state:{role:user.toLowerCase()}});
                        }}>Sign Up</button></div>
                    </div>
                </div>
                <div className='w-1/2'>
                    <div className="font-bold text-2xl pl-8">Signing In as an <span className='text-3xl text-[#5b21b6]'>{user}</span></div>
                    <img src={personimage} alt="student" className='h-5/6 w-1/2 rounded-2xl mt-12 ml-12 p-1 light-on-hover'/>
                    <div className='mt-4 ml-12 pl-8 text-gray-400'>Not A <span className='font-bold'>{user}</span>? <span className='text-white hover:cursor-pointer hover:underline' onClick={changeUser}>Change Role</span></div>
                </div>
            </div>
        </div>
    );
}