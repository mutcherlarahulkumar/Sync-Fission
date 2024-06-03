


export default function TutorReplyCard({reply}) {

    return <div className="bg-pink-800  rounded-lg shadow-sm p-4 mb-7">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-medium">{reply}</h2>
      <span className="bg-gray-100  text-gray-500  px-2 py-1 rounded-full text-xs">
        12 replies
      </span>
    </div>
    <p className="text-gray-500  line-clamp-2">
      Solved and Verified by {'  Tutor'}
    </p>
  </div>
}