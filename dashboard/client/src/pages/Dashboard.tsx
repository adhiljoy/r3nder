import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Shield, Sparkles, Activity, Users, Send, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Skeleton from "../components/ui/Skeleton";

const Dashboard = () => {
    const { guildId } = useParams();
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        axios.get(`http://localhost:3001/api/guild/${guildId}/settings`, { withCredentials: true })
            .then(res => setSettings(res.data))
            .catch(console.error);
    }, [guildId]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.4, 
                staggerChildren: 0.1 
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (!settings) return (
        <div className="space-y-10">
            <div className="space-y-4">
                <Skeleton height={40} width={200} />
                <Skeleton height={20} width={400} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height={160} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="lg:col-span-2" height={400} />
                <Skeleton height={400} />
            </div>
        </div>
    );

    const stats = [
        { label: "Active Users", value: "1,284", change: "+12%", icon: <Users size={20} />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Messages / Min", value: "42", change: "+5%", icon: <Send size={20} />, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "AI Interactions", value: "892", change: "+18%", icon: <Sparkles size={20} />, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { label: "Protection Level", value: "98%", change: "Stable", icon: <Shield size={20} />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    ];

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight text-white">Overview</h2>
                <p className="text-white/40 text-lg">Real-time pulse of your community managed by R3NDER AI.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i} 
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="glass-card p-6 flex flex-col gap-4 group cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase bg-white/5 py-1 px-2 rounded-lg text-white/40 group-hover:text-white transition-colors">
                                {stat.change}
                                <ArrowUpRight size={10} className="opacity-40" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                            <h4 className="text-3xl font-black mt-1 tracking-tighter text-white">{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Activity Chart Placeholder */}
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Activity className="text-primary" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Community Activity</h3>
                        </div>
                        <div className="flex gap-4 text-[10px] font-black uppercase text-white/20 tracking-widest">
                            <span className="text-primary cursor-pointer">1h</span>
                            <span className="hover:text-white/40 cursor-pointer">6h</span>
                            <span className="hover:text-white/40 cursor-pointer">24h</span>
                        </div>
                    </div>
                    <div className="flex-1 border-b border-l border-white/5 flex items-end justify-between px-4 pb-4">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 45, 30, 85].map((h, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                className="w-4 bg-linear-to-t from-primary/10 to-primary/80 rounded-t-lg hover:from-primary/40 hover:to-primary transition-all duration-300 cursor-crosshair relative group/bar"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* AI Status / Quick Actions */}
                <motion.div variants={itemVariants} className="glass-card p-8 space-y-8 flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-premium/10 rounded-2xl">
                            <Sparkles className="text-premium" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">AI Autopilot</h3>
                    </div>
                    
                    <div className="space-y-6 flex-1">
                        <div className="p-6 rounded-3xl bg-white/3 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest text-white/30">System Status</span>
                                <span className="flex items-center gap-2 text-[10px] bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Active
                                </span>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed font-outfit">
                                Autopilot is currently monitoring **12 active channels** and providing contextual re-engagement.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="premium-btn w-full shadow-primary/40"
                            >
                                View AI Insights
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 font-bold text-sm transition-all"
                            >
                                Security Settings
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
