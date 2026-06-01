export default function Assignment({ title, description, date, link }) {
    return (
        <div className="p-4 rounded-lg bg-gray-700 border border-gray-600">
            <div className="font-semibold text-white text-base mb-1">{title}</div>
            <div className="text-gray-300 text-sm mb-2">{description}</div>
            {link && (
                <div className="text-sm mb-1">
                    <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        View Resource ↗
                    </a>
                </div>
            )}
            <div className="text-xs text-red-400 font-medium">Due: {date}</div>
        </div>
    );
}
