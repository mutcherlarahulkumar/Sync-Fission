import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const isHome = location.pathname === '/';
    const isAuth = location.pathname === '/signin' || location.pathname === '/signup';

    function logout() {
        localStorage.removeItem('token');
        navigate('/');
    }

    if (isAuth) return null;

    return (
        <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
            <button
                onClick={() => navigate('/')}
                className="text-white font-bold text-lg tracking-wide hover:text-purple-400 transition-colors"
            >
                Sync<span className="text-purple-500">Fission</span>
            </button>
            <div className="flex items-center gap-4">
                {!isHome && (
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        ← Back
                    </button>
                )}
                {token && !isHome && (
                    <button
                        onClick={logout}
                        className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}
