import React from "react";
import { useNavigate } from "react-router-dom";

export default function DoubtCardTutor({ title, description, class_id, doubt_id }) {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm mb-1 truncate">{title}</div>
                <p className="text-gray-400 text-xs line-clamp-2">{description}</p>
            </div>
            <button
                className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-md shrink-0 transition-colors"
                onClick={() => navigate('/doubt-discussion-tutor', { state: { class_id, doubt_id } })}
            >
                Solve
            </button>
        </div>
    );
}
