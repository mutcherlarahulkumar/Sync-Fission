export default function Popup({ children, show, close }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60" onClick={close}>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end mb-2">
                    <button onClick={close} className="text-gray-400 hover:text-red-400 transition-colors text-lg leading-none">✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}
