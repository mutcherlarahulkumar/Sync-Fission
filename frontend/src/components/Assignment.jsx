export default function Assignement({title,description,date,link}){
    return (
        <div className="text-black p-4 rounded-lg bg-[#d9e6f7]">
            <div className="font-bold ">
                <div className="text-xl pb-1">Title : {title}</div>
                <div className="text-sm">Description : {description}</div>
                <div>Link : <span className="text-blue-400">{link}</span></div>
                <div >Due Date : <span className="text-red-400">{date}</span></div>
            </div>
        </div>
    )
}