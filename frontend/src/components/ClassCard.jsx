import { useNavigate } from "react-router-dom"
export default function ClassCard({id,name, description,user}) {
    const message = (user === "student") ? "Joined" : "Created"
    const navigate = useNavigate();
    return (
        <div className="bg-[#4f46e5] p-6 rounded-lg mb-10">
            <div className="text-xl font-bold mb-2">
                {name}
            </div>
            <p className="text-gray-400 mb-4">{description}</p>
            <div className="flex items-center justify-between">
                <button onClick={()=>{
                    if(user === "student") navigate(`/classroom-student`,{state:{id:id}})
                    else if(user === "tutor") navigate(`/classroom-tutor`,{state:{id:id}})
                }}>View Class</button>
                <div>{message}</div>
            </div>
        </div>
    )
}