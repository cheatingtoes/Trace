import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ActivityDashboard from './features/activities/components/ActivityDashboard';
import ActivityDetail from './features/activities/components/ActivityDetail';

import Login from './pages/Login';
import Register from './pages/Register';
import MapLayout from './layouts/MapLayout';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const AppRoutes = () => (
    <Routes>
        <Route element={<MapLayout />}>
            <Route element={<AuthLayout />}>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
            </Route>
            <Route element={<MainLayout />}>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<ActivityDashboard />} />
                    <Route path="/activity/:id" element={<ActivityDetail />} />
                </Route>
            </Route>
        </Route>
    </Routes>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;