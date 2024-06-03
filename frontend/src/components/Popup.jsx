export default function Popup({ children, show, close }) {
    return (
        <>
            {show ? (
                <>
                    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
                        <div className="bg-gray-800 p-8 rounded-lg">
                            <div className="flex justify-end">
                                <button onClick={close} className="hover:cursor-pointer hover:text-red-500">X</button>
                            </div>
                            {children}
                        </div>
                    </div>
                </>
            ) : null}
        </>
    )
}