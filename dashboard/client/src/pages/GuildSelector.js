"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const AuthContext_1 = require("../context/AuthContext");
const GuildSelector = () => {
    const { user, logout } = (0, AuthContext_1.useAuth)();
    const [guilds, setGuilds] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchGuilds = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
                const res = await axios_1.default.get(`${API_URL}/api/guilds`, { withCredentials: true });
                setGuilds(res.data.guilds);
            }
            catch (err) {
                console.error("Nexus Sync Failed:", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchGuilds();
    }, []);
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };
    return (<div className="min-h-screen pt-20 pb-32">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"/>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full"/>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-10 border-b border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <lucide_react_1.Server size={18} className="text-white"/>
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Nexus Clusters</h1>
                        </div>
                        <p className="text-white/30 font-medium">Select a nexus environment to orchestrate</p>
                    </div>

                    <div className="flex items-center gap-4 p-2 rounded-2xl glass-card border-white/5">
                        <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-xl"/>
                        <div className="pr-4 border-r border-white/10 hidden sm:block">
                            <p className="text-xs font-black uppercase tracking-widest">{user.username}</p>
                            <p className="text-[10px] text-white/30 font-medium">Global Orchestrator</p>
                        </div>
                        <button onClick={logout} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                            <lucide_react_1.LogOut size={20}/>
                        </button>
                    </div>
                </header>

                {/* Guild Grid */}
                {loading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (<div key={i} className="h-64 rounded-2xl bg-white/3 animate-pulse border border-white/5"/>))}
                    </div>) : (<framer_motion_1.motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <framer_motion_1.AnimatePresence>
                            {guilds.map((guild) => (<framer_motion_1.motion.div variants={item} key={guild.id} className="glass-card p-8 space-y-8 glass-card-hover group relative overflow-hidden">
                                    {/* Status Badge */}
                                    <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${guild.botInstalled
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-white/5 border-white/10 text-white/20"}`}>
                                        {guild.botInstalled ? "ACTIVE" : "SETUP REQ"}
                                    </div>

                                    {/* Guild Info */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <img src={guild.icon || `https://ui-avatars.com/api/?name=${guild.name}&background=7c3aed&color=fff`} alt={guild.name} className="w-16 h-16 rounded-3xl shadow-xl shadow-black/40 group-hover:scale-110 transition-transform duration-500 border border-white/10"/>
                                            {guild.botInstalled && (<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg border-2 border-background-end flex items-center justify-center">
                                                    <lucide_react_1.Sparkles size={12}/>
                                                </div>)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold uppercase tracking-tight truncate max-w-[120px] lg:max-w-none">{guild.name}</h3>
                                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">ID: {guild.id}</p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-4">
                                        {guild.botInstalled ? (<react_router_dom_1.Link to={`/app/${guild.id}`} className="premium-btn w-full group/btn">
                                                MANAGE NEXUS <lucide_react_1.ArrowRight className="group-hover/btn:translate-x-1 transition-transform"/>
                                            </react_router_dom_1.Link>) : (<a href={`https://discord.com/api/oauth2/authorize?client_id=1488858779784188165&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`} target="_blank" rel="noreferrer" className="premium-btn-outline w-full group/btn">
                                                INSTALL R3NDER <lucide_react_1.Plus className="group-hover/btn:rotate-90 transition-transform"/>
                                            </a>)}
                                    </div>
                                </framer_motion_1.motion.div>))}
                        </framer_motion_1.AnimatePresence>

                        {/* Direct ID Onboarding */}
                        <framer_motion_1.motion.div variants={item} className="glass-card p-8 border-dashed border-white/20 flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/3 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform group-hover:text-primary">
                                <lucide_react_1.Plus size={32}/>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-tight text-white/40 group-hover:text-white transition-colors">Add New Nexus</h3>
                                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Invite to external cluster</p>
                            </div>
                        </framer_motion_1.motion.div>
                    </framer_motion_1.motion.div>)}
            </div>
        </div>);
};
exports.default = GuildSelector;
