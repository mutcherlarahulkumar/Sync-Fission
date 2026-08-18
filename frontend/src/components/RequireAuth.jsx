import { Navigate, useLocation } from 'react-router-dom';
import { isSignedIn, getRole } from '../api';

// Route guard.
//
// Before this, every dashboard route rendered for anyone who typed the URL —
// the page mounted, fired its API calls, got 403s back, and left you staring at
// an empty shell. The API was never actually exposed (it checks the JWT), but
// the app looked broken instead of asking you to sign in.
//
// Pass `role` to also keep a student out of the tutor views and vice versa.
export default function RequireAuth({ role, children }) {
    const location = useLocation();

    if (!isSignedIn()) {
        // Remember where they were headed so sign-in can send them back.
        return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
    }

    if (role && getRole() && getRole() !== role) {
        return <Navigate to={`/${getRole()}-dashboard`} replace />;
    }

    return children;
}
