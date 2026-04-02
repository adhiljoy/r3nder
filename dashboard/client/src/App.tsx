import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import GuildSelector from "./pages/GuildSelector";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Skeleton from "./components/ui/Skeleton";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    if (!user) return <Navigate to="/" />;
    return children;
};

// Lazy Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const ServerLogs = lazy(() => import("./pages/ServerLogs"));
const AIControl = lazy(() => import("./pages/AIControl"));
const Music = lazy(() => import("./pages/Music"));
const ServerAnalytics = lazy(() => import("./pages/ServerAnalytics"));
const Subscription = lazy(() => import("./pages/Subscription"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const LogViewer = lazy(() => import("./pages/admin/LogViewer"));

const PageLoader = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton height={100} className="w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton height={200} />
            <Skeleton height={200} />
            <Skeleton height={200} />
        </div>
        <Skeleton height={400} className="w-full" />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/guilds" element={<ProtectedRoute><GuildSelector /></ProtectedRoute>} />
                    <Route 
                        path="/dashboard/:guildId/*" 
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <Suspense fallback={<PageLoader />}>
                                        <Routes>
                                            <Route path="/" element={<Dashboard />} />
                                            <Route path="profile" element={<UserProfile />} />
                                            <Route path="server-logs" element={<ServerLogs />} />
                                            <Route path="ai" element={<AIControl />} />
                                            <Route path="music" element={<Music />} />
                                            <Route path="analytics" element={<ServerAnalytics />} />
                                            <Route path="subscription" element={<Subscription />} />
                                            <Route path="settings" element={<div>General Settings</div>} />
                                            <Route path="admin/overview" element={<AdminOverview />} />
                                            <Route path="admin/logs" element={<LogViewer />} />
                                        </Routes>
                                    </Suspense>
                                </DashboardLayout>
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
