import React from "react";
import { useNavigate } from "react-router-dom";

export default function DoubtCardTutor({title, description, class_id, doubt_id}){
    const navigate = useNavigate();

    return <div className="py-2">
        <div className="text-white text-2xl">Title :
      <span className="text-blue-500">{title}
      </span>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[#8c9bab] text-lg w-full">Description : {description} </p>
      </div>
      <button size="sm" type="button" className="text-blue-400" onClick={()=>{
        navigate(`/doubt-discussion-tutor`, {state: {class_id, doubt_id}});
      }}>
        Solve
      </button>
    </div>
    </div>
}