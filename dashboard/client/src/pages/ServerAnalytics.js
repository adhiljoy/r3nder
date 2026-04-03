"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const recharts_1 = require("recharts");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const Skeleton_1 = __importDefault(require("../components/ui/Skeleton"));
const ServerAnalytics = () => {
    const { guildId } = (0, react_router_dom_1.useParams)();
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const fetchAnalytics = () => {
        const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
        axios_1.default.get(`${API_URL}/api/guild/${guildId}/analytics`, { withCredentials: true })
            .then(res => {
            setData(res.data);
            setLoading(false);
        })
            .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };
    (0, react_1.useEffect)(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000); // 30s refresh for live feel
        return () => clearInterval(interval);
    }, [guildId]);
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, staggerChildren: 0.1 }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };
    if (loading)
        return (<div className="space-y-8">
            <Skeleton_1.default height={60} width={300}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton_1.default key={i} height={120}/>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton_1.default className="lg:col-span-2" height={400}/>
                <Skeleton_1.default height={400}/>
            </div>
        </div>);
    if (!data)
        return <div className="text-white/50 text-center py-20">No analytics data found for this server yet.</div>;
    const statsCards = [
        { label: "Active Users (15m)", value: data.stats.activeUsers, icon: <lucide_react_1.Users size={20}/>, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Messages (24h)", value: data.stats.totalMessages24h, icon: <lucide_react_1.MessageSquare size={20}/>, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Voice Attendance", value: data.stats.voiceAttendance, icon: <lucide_react_1.Activity size={20}/>, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Avg MPM", value: (data.stats.totalMessages24h / (24 * 60)).toFixed(1), icon: <lucide_react_1.Clock size={20}/>, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    ];
    return (<framer_motion_1.motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <framer_motion_1.motion.div variants={itemVariants}>
                <h1 className="text-3xl font-black tracking-tighter text-white">Server Insights</h1>
                <p className="text-white/40 font-medium">Forensic activity monitoring and user behavior patterns</p>
            </framer_motion_1.motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, i) => (<framer_motion_1.motion.div key={i} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card p-6 border border-white/5 space-y-4 hover:border-white/20 transition-colors group">
                        <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                            {card.icon}
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{card.label}</div>
                            <div className="text-2xl font-black text-white mt-1">{card.value.toLocaleString()}</div>
                        </div>
                    </framer_motion_1.motion.div>))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <framer_motion_1.motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <lucide_react_1.TrendingUp className="text-primary" size={24}/>
                            Activity Timeline
                        </h2>
                        <span className="text-[10px] font-black uppercase text-white/10 tracking-[0.2em]">24H Window • 15M Res</span>
                    </div>
                    
                    <div className="h-80 w-full">
                        <recharts_1.ResponsiveContainer width="100%" height="100%">
                            <recharts_1.LineChart data={data.timeline}>
                                <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false}/>
                                <recharts_1.XAxis dataKey="time" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} interval={6}/>
                                <recharts_1.YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false}/>
                                <recharts_1.Tooltip contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #ffffff10", borderRadius: "16px", fontSize: "12px", backdropFilter: "blur(12px)" }} itemStyle={{ color: "#8B5CF6" }}/>
                                <recharts_1.Line type="monotone" dataKey="messages" stroke="#8B5CF6" strokeWidth={4} dot={false} activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 3, fill: "#fff" }} animationDuration={1500}/>
                                <recharts_1.Line type="monotone" dataKey="activeUsers" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false}/>
                            </recharts_1.LineChart>
                        </recharts_1.ResponsiveContainer>
                    </div>
                </framer_motion_1.motion.div>

                {/* Side Stats */}
                <div className="space-y-8">
                    {/* Top Users */}
                    <framer_motion_1.motion.div variants={itemVariants} className="glass-card p-8 border border-white/5 space-y-6">
                        <div className="space-y-4">
                            {data.stats.topUsers.slice(0, 5).map((user, i) => (<div key={user.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/30 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                            0{i + 1}
                                        </div>
                                        <div className="text-sm font-bold text-white/70 font-mono truncate max-w-[100px]">
                                            {user.id}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-primary/60 uppercase border border-primary/20 px-2 py-1 rounded-md">
                                        {user.activity} OPS
                                    </div>
                                </div>))}
                        </div>
                    </framer_motion_1.motion.div>

                    {/* Command Distribution */}
                    <framer_motion_1.motion.div variants={itemVariants} className="glass-card p-8 border border-white/5 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <lucide_react_1.Zap size={14} className="text-yellow-400"/>
                            Trigger Distribution
                        </h2>
                        <div className="h-40">
                            <recharts_1.ResponsiveContainer width="100%" height="100%">
                                <recharts_1.BarChart data={data.stats.topCommands.slice(0, 5)}>
                                    <recharts_1.XAxis dataKey="name" hide/>
                                    <recharts_1.Tooltip contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #ffffff10", borderRadius: "12px", fontSize: "10px" }}/>
                                    <recharts_1.Bar dataKey="count" fill="#8B5CF620" stroke="#8B5CF6" strokeWidth={2} radius={[6, 6, 0, 0]}/>
                                </recharts_1.BarChart>
                            </recharts_1.ResponsiveContainer>
                        </div>
                    </framer_motion_1.motion.div>
                </div>
            </div>
        </framer_motion_1.motion.div>);
};
exports.default = ServerAnalytics;
