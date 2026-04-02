import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";

const PageLoader = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background-start text-white gap-6">
        <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin shadow-2xl shadow-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse text-center">Syncing Nexus Pulse...</p>
    </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user || !(user as any).isAdmin) return <Navigate to="/app" />;
    return children;
};

// High-Fidelity SaaS Pages
const GuildSelector = lazy(() => import("./pages/GuildSelector"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminOverview = lazy(() => import("./pages/AdminOverview"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public SaaS Entry */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* User Nexus Hub */}
                    <Route path="/app" element={
                        <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                                <GuildSelector />
                            </Suspense>
                        </ProtectedRoute>
                    } />

                    {/* Server Command Suite */}
                    <Route path="/app/:guildId/*" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route index element={<Dashboard />} />
                                        <Route path=":tab" element={<Dashboard />} />
                                        <Route path="profile" element={<UserProfile />} />
                                        <Route path="*" element={<Navigate to="" replace />} />
                                    </Routes>

                                </Suspense>
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    {/* Global Admin Core */}
                    <Route path="/core/*" element={
                        <AdminRoute>
                            <DashboardLayout isCore>
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="overview" element={<AdminOverview />} />
                                        <Route path="analytics" element={<AdminOverview />} />
                                        <Route path="status" element={<AdminOverview />} />
                                        <Route path="logs" element={<AdminLogs />} />
                                        <Route path="*" element={<Navigate to="overview" replace />} />
                                    </Routes>

                                </Suspense>
                            </DashboardLayout>
                        </AdminRoute>
                    } />

                    {/* Final Catch-All */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
