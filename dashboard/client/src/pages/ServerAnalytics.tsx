import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
    ResponsiveContainer, LineChart, Line, BarChart, Bar, 
    XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { 
    Users, MessageSquare, Zap, Activity, Clock, TrendingUp 
} from "lucide-react";
import { motion } from "framer-motion";
import Skeleton from "../components/ui/Skeleton";

const ServerAnalytics = () => {
    const { guildId } = useParams<{ guildId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = () => {
        const API_URL = import.meta.env.VITE_API_URL || "https://https://r3nder-api.onrender.com";
        axios.get(`${API_URL}/api/guild/${guildId}/analytics`, { withCredentials: true })
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };


    useEffect(() => {
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

    if (loading) return (
        <div className="space-y-8">
            <Skeleton height={60} width={300} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <Skeleton key={i} height={120} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="lg:col-span-2" height={400} />
                <Skeleton height={400} />
            </div>
        </div>
    );
    
    if (!data) return <div className="text-white/50 text-center py-20">No analytics data found for this server yet.</div>;

    const statsCards = [
        { label: "Active Users (15m)", value: data.stats.activeUsers, icon: <Users size={20} />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Messages (24h)", value: data.stats.totalMessages24h, icon: <MessageSquare size={20} />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Voice Attendance", value: data.stats.voiceAttendance, icon: <Activity size={20} />, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Avg MPM", value: (data.stats.totalMessages24h / (24 * 60)).toFixed(1), icon: <Clock size={20} />, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    ];

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-black tracking-tighter text-white">Server Insights</h1>
                <p className="text-white/40 font-medium">Forensic activity monitoring and user behavior patterns</p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, i) => (
                    <motion.div 
                        key={i} 
                        variants={itemVariants}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="glass-card p-6 border border-white/5 space-y-4 hover:border-white/20 transition-colors group"
                    >
                        <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                            {card.icon}
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{card.label}</div>
                            <div className="text-2xl font-black text-white mt-1">{card.value.toLocaleString()}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <TrendingUp className="text-primary" size={24} />
                            Activity Timeline
                        </h2>
                        <span className="text-[10px] font-black uppercase text-white/10 tracking-[0.2em]">24H Window • 15M Res</span>
                    </div>
                    
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.timeline}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#ffffff10" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    interval={6}
                                />
                                <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #ffffff10", borderRadius: "16px", fontSize: "12px", backdropFilter: "blur(12px)" }}
                                    itemStyle={{ color: "#8B5CF6" }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="messages" 
                                    stroke="#8B5CF6" 
                                    strokeWidth={4} 
                                    dot={false}
                                    activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 3, fill: "#fff" }}
                                    animationDuration={1500}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="activeUsers" 
                                    stroke="#3B82F6" 
                                    strokeWidth={2} 
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Side Stats */}
                <div className="space-y-8">
                    {/* Top Users */}
                    <motion.div variants={itemVariants} className="glass-card p-8 border border-white/5 space-y-6">
                        <div className="space-y-4">
                            {data.stats.topUsers.slice(0, 5).map((user: any, i: number) => (
                                <div key={user.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/30 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                            0{i+1}
                                        </div>
                                        <div className="text-sm font-bold text-white/70 font-mono truncate max-w-[100px]">
                                            {user.id}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-primary/60 uppercase border border-primary/20 px-2 py-1 rounded-md">
                                        {user.activity} OPS
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Command Distribution */}
                    <motion.div variants={itemVariants} className="glass-card p-8 border border-white/5 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Zap size={14} className="text-yellow-400" />
                            Trigger Distribution
                        </h2>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.stats.topCommands.slice(0, 5)}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #ffffff10", borderRadius: "12px", fontSize: "10px" }}
                                    />
                                    <Bar dataKey="count" fill="#8B5CF620" stroke="#8B5CF6" strokeWidth={2} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ServerAnalytics;
