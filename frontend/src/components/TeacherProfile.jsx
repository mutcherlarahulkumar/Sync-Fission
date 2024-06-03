export default function TeacherProfile({name}){
    return <div className="flex justify-between">
    <div className="flex space-x-4">
        <div className="w-10 h-10 bg-gray-400 rounded-full flex justify-center items-center text-pink-700">{name[0]}</div>
        <div className="flex flex-col">
            <div className="font-bold text-black">{name}</div>
            <div className="text-sm text-gray-600">Tutor</div>
        </div>
    </div>
</div>
}