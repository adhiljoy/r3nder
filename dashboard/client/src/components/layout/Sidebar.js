"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const AuthContext_1 = require("../../context/AuthContext");
const Sidebar = ({ guildId, isCore = false, isOpen, onClose }) => {
    const location = (0, react_router_dom_1.useLocation)();
    const { logout, user } = (0, AuthContext_1.useAuth)();
    const isAdmin = user?.isAdmin;
    const navItems = isCore ? [
        { id: "overview", label: "Global Pulse", icon: <lucide_react_1.Globe size={20}/>, path: "/core/overview" },
        { id: "logs", label: "Forensic Logs", icon: <lucide_react_1.Terminal size={20}/>, path: "/core/logs" },
        { id: "analytics", label: "Network Stats", icon: <lucide_react_1.BarChart3 size={20}/>, path: "/core/analytics" },
        { id: "status", label: "Node Health", icon: <lucide_react_1.ShieldAlert size={20}/>, path: "/core/status" }
    ] : [
        { id: "dashboard", label: "Overview", icon: <lucide_react_1.LayoutDashboard size={20}/>, path: `/app/${guildId}` },
        { id: "ai", label: "AI Autopilot", icon: <lucide_react_1.Zap size={20}/>, path: `/app/${guildId}/ai` },
        { id: "music", label: "Music Flux", icon: <lucide_react_1.Music size={20}/>, path: `/app/${guildId}/music` },
        { id: "analytics", label: "Nexus Stats", icon: <lucide_react_1.Activity size={20}/>, path: `/app/${guildId}/analytics` },
        { id: "settings", label: "Executive", icon: <lucide_react_1.Settings size={20}/>, path: `/app/${guildId}/settings` }
    ];
    const container = {
        hidden: { opacity: 0, x: -20 },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };
    return (<aside className={`fixed inset-y-0 left-0 z-50 w-80 lg:relative lg:block glass-sidebar bg-white/2 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
            <div className="h-full flex flex-col p-8 space-y-12">
                {/* Brand Logo */}
                <header className="flex items-center justify-between">
                    <react_router_dom_1.Link to="/" className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-700 hover:scale-110 ${isCore ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/30"}`}>
                            <lucide_react_1.Zap className="text-white" size={24}/>
                        </div>
                        <span className="text-2xl font-black tracking-tighter italic uppercase text-white">R3NDER</span>
                    </react_router_dom_1.Link>
                    <button onClick={onClose} className="lg:hidden text-white/30"><lucide_react_1.X /></button>
                </header>

                {/* Primary Navigation Hub */}
                <framer_motion_1.motion.nav variants={container} initial="hidden" animate="show" className="flex-1 space-y-2">
                    <p className={`px-4 text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${isCore ? "text-red-500/40" : "text-primary/40"}`}>Management Suite</p>
                    {navItems.map((nav) => {
            const isActive = location.pathname === nav.path;
            return (<framer_motion_1.motion.div variants={item} key={nav.id}>
                                <react_router_dom_1.Link to={nav.path} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-500 font-bold text-sm group ${isActive
                    ? `${isCore ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10" : "bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/10"} border`
                    : "text-white/30 hover:text-white/80 hover:bg-white/3"}`}>
                                    <div className={`${isActive ? (isCore ? "text-red-500" : "text-primary") : "text-white/20 group-hover:text-white/40"} transition-colors`}>{nav.icon}</div>
                                    <span>{nav.label}</span>
                                    {isActive && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isCore ? "bg-red-500" : "bg-primary"} shadow-lg`}/>}
                                </react_router_dom_1.Link>
                            </framer_motion_1.motion.div>);
        })}

                    {/* Admin Switcher */}
                    {isAdmin && !isCore && (<framer_motion_1.motion.div variants={item} className="pt-10">
                            <react_router_dom_1.Link to="/core/overview" className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-orange-500/5 text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-500 font-black border border-orange-500/10 uppercase text-[10px] tracking-widest">
                                <lucide_react_1.ShieldCheck size={18}/> ADMIN DASHBOARD
                            </react_router_dom_1.Link>
                        </framer_motion_1.motion.div>)}
                </framer_motion_1.motion.nav>

                {/* Profile Footer Hub */}
                <footer className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={user.avatar} className="w-12 h-12 rounded-2xl border border-white/10 shadow-xl shadow-black/40" alt="Avatar"/>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight text-white mb-0.5">{user.username}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                {user.premiumTier || "Free"} Pulse
                            </p>
                        </div>

                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white/3 text-white/20 hover:bg-white/5 hover:text-red-400 transition-all duration-500 font-black text-[10px] tracking-widest border border-white/5 uppercase">
                        <lucide_react_1.LogOut size={16}/> SIGN OUT OF NEXUS
                    </button>
                </footer>
            </div>
        </aside>);
};
exports.default = Sidebar;
