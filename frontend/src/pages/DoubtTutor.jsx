import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DoubtCardTutor from '../components/DoubtCardTutor';
import { useLocation } from 'react-router-dom';
import Spinner from '../components/Spinner';


export default function DoubtTutor(){
    const location = useLocation();

    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const class_id = location.state.id;
    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(()=>{
        axios.get(`http://localhost:3000/api/v1/tutor/class/${class_id}/doubts`,config).then((res)=>{
            setDoubts(res.data.doubts);
            setLoading(false);
        }).catch((err)=>{
            console.log(err);
        })
    },[class_id])
    return (
        loading ? <Spinner /> :
        <div className='bg-[#03040e] h-screen p-5'>
            <div className="space-y-4">
              <h3 className="text-3xl p-4 font-extrabold text-white"> Doubts</h3>
              <div className="space-y-2">
              {
                doubts.map((doubt)=>{
                    return <DoubtCardTutor key={doubt.id} title={doubt.title} description={doubt.description} class_id={class_id} doubt_id={doubt.id} />
                })
              }
              </div>
            </div>
        </div>
    )
}