export default function Announcement({ title, description }) {
    return (
        <div className="border-b border-gray-600 pb-3 last:border-0 last:pb-0">
            <p className="text-white font-medium text-sm">{title}</p>
            {description && <p className="text-gray-400 text-xs mt-1">{description}</p>}
        </div>
    );
}
