export default function StudentProfile({ name, email }) {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-700 rounded-full flex justify-center items-center text-white font-semibold text-sm shrink-0">
                {initials}
            </div>
            <div>
                <div className="font-medium text-black text-sm">{name}</div>
                {email && <div className="text-xs text-gray-500">{email}</div>}
            </div>
        </div>
    );
}
