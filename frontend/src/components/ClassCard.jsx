import { useNavigate } from "react-router-dom"

export default function ClassCard({ id, name, description, user }) {
    const navigate = useNavigate();
    const badge = user === "student" ? "Joined" : "Created";

    return (
        <div className="bg-gray-700 hover:bg-gray-600 p-5 rounded-lg transition-colors cursor-pointer border border-gray-600"
            onClick={() => {
                if (user === "student") navigate('/classroom-student', { state: { id } });
                else navigate('/classroom-tutor', { state: { id } });
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="text-base font-bold text-white truncate pr-2">{name}</div>
                <span className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full shrink-0">{badge}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
            <div className="mt-3 text-purple-400 text-sm font-medium hover:text-purple-300">
                View Class →
            </div>
        </div>
    );
}
