import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { useState } from 'react';
import DoubtCardStudent from '../components/DoubtCardStudent';


export default function DoubtStudent(){

    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const class_id = location.state.id;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };


        useEffect(()=>{
            axios.get(`http://localhost:3000/api/v1/student/class/${class_id}/doubts`,config).then((res)=>{
                setDoubts(res.data.doubts);
                setLoading(false);
            }).catch((err)=>{
                console.log(err);
            })
        },[class_id])

    function askDoubt(e){
        e.preventDefault();
        if(title==='' || description===''){
            toast.error('Please fill all the fields');
            return;
        }
        axios.post(`http://localhost:3000/api/v1/student/class/${class_id}/askdoubt`, {
            title: title,
            description: description,
            class_id: class_id
        },config).then((res)=>{
            toast.success('Doubt Submitted Successfully');
        }).catch((err)=>{
            toast.error('Failed to submit doubt');
        })
    }
    return (
        
        <div className="bg-[#03040e]">
        <ToastContainer />
        <section className="container mx-auto py-12 px-4 md:px-6 bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Doubts Discussion</h1>
          <div className="space-y-8">
            <form className="bg-gray-800 p-6 rounded-lg ">
              <h3 className="text-lg font-medium mb-4">Submit a New Doubt</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block mb-2">
                    Title
                  </label>
                  <input placeholder="Title for your doubt" className="bg-gray-800 border rounded-md px-6 py-2" onChange={(e)=>{setTitle(e.target.value)}} />
                </div>
                <div>
                  <label className="block mb-2">
                    Description
                  </label>
                  <textarea className=" bg-gray-800 border h-full px-8 rounded-md py-4" placeholder="Describe your doubt in detail" onChange={(e)=>{setDescription(e.target.value)}} />
                </div>
                <button className="justify-self-end bg-blue-400 rounded-md p-3" type="submit" onClick={askDoubt}>
                  Submit Doubt
                </button>
              </div>
            </form>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Previous Doubts</h3>
              <div className="space-y-2">
              {
                  doubts.map((doubt)=>{
                    return <DoubtCardStudent key={doubt.id} title={doubt.title} description={doubt.description} class_id={class_id} doubt_id={doubt.id} />
                })
              }
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    )
}