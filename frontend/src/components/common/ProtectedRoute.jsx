import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
    const { token, isLoading, loadUser, user } = useAuthStore();
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const check = async () => {
            await loadUser();
            setIsChecked(true);
        };
        check();
    }, []);

    if (isLoading || !isChecked) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
