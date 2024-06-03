export default function Announcement({title,date}){
    return <div>
    <p className="text-black">{title}.</p>
    <p className="text-[#8c9bab] text-sm">Posted on {date}</p>
</div>
}