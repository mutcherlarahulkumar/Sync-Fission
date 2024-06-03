export default function Resource({title, link, type}){
    return <div>
    <p className="text-black">Title :
      <a className="text-blue-500 hover:underline" href={link}>
        {' '+title}
      </a>
    </p>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[#8c9bab] text-sm">Link : {link}</p>
        <p className="text-[#8c9bab] text-sm">Type: {type}</p>
      </div>
      <button size="sm" type="button" className="text-blue-400" onClick={()=>{
        window.location.href = link;
      }}>
        View
      </button>
    </div>
  </div>
}