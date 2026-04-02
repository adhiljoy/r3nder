import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Zap, Music, Settings, Activity, Sparkles, ShieldCheck, LogOut,
    User, Terminal, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ guildId, onClose }: { guildId: string, onClose?: () => void }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} />, path: `/dashboard/${guildId}` },
        { id: "ai", label: "AI Control", icon: <Zap size={22} />, path: `/dashboard/${guildId}/ai` },
        { id: "music", label: "Music Sync", icon: <Music size={22} />, path: `/dashboard/${guildId}/music` },
        { id: "analytics", label: "Analytics", icon: <Activity size={22} />, path: `/dashboard/${guildId}/analytics` },
        { id: "logs", label: "Server Logs", icon: <Terminal size={22} />, path: `/dashboard/${guildId}/server-logs` },
        { id: "subscription", label: "Premium", icon: <Sparkles size={22} />, path: `/dashboard/${guildId}/subscription` },
        { id: "settings", label: "General", icon: <Settings size={22} />, path: `/dashboard/${guildId}/settings` },
    ];

    return (
        <aside className="w-72 h-screen glass-sidebar flex flex-col relative z-60">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/guilds" className="group flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">
                            R3NDER
                        </span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-xl bg-white/5 text-white/50 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {user?.premiumTier && user.premiumTier !== "free" && (
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${user.premiumTier === "ultra" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                        <Sparkles size={12} />
                        {user.premiumTier} Member
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Management</p>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group ${isActive
                                ? "bg-white/8 text-white shadow-inner border border-white/5"
                                : "text-white/40 hover:text-white/80 hover:bg-white/3"
                                }`}
                        >
                            <div className={`${isActive ? "text-primary" : "text-white/40 group-hover:text-white/60"} transition-colors`}>
                                {item.icon}
                            </div>
                            {item.label}
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />}
                        </Link>
                    );
                })}

                <div className="pt-8 space-y-2">
                    <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Account</p>
                    <Link
                        to="/dashboard/profile"
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group ${location.pathname === "/dashboard/profile"
                            ? "bg-white/8 text-white border border-white/5"
                            : "text-white/40 hover:text-white/80 hover:bg-white/3"
                            }`}
                    >
                        <User className={`${location.pathname === "/dashboard/profile" ? "text-primary" : "text-white/40 group-hover:text-white/60"}`} size={22} />
                        My Profile
                    </Link>
                </div>

                {/* Admin Only Section */}
                {(user as any)?.isAdmin && (
                    <div className="pt-8 space-y-2">
                        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-red-500/50 mb-4">Admin Command Center</p>
                        <Link
                            to="/admin/overview"
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group ${location.pathname === "/admin/overview"
                                ? "bg-red-500/10 text-white border border-red-500/20"
                                : "text-white/40 hover:text-white/80 hover:bg-white/3"
                                }`}
                        >
                            <ShieldCheck className={`${location.pathname === "/admin/overview" ? "text-red-500" : "text-white/40 group-hover:text-white/60"}`} size={22} />
                            Admin Overview
                        </Link>
                        <Link
                            to="/admin/logs"
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group ${location.pathname === "/admin/logs"
                                ? "bg-red-500/10 text-white border border-red-500/20"
                                : "text-white/40 hover:text-white/80 hover:bg-white/3"
                                }`}
                        >
                            <Activity className={`${location.pathname === "/admin/logs" ? "text-red-500" : "text-white/40 group-hover:text-white/60"}`} size={22} />
                            Bot Logs
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
