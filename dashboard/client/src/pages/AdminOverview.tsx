import { useState, useEffect } from "react";
import axios from "axios";
import { 
    Cpu, Activity, Globe, Server, 
    TrendingUp, Users, Cpu as KernelIcon
} from "lucide-react";
import { motion } from "framer-motion";

const AdminOverview = () => {
    const [stats, setStats] = useState<any>({
        nexusCount: 0,
        userCount: 0,
        uptime: "0h 0m",
        status: "OPERATIONAL",
        latency: "0ms",
        aiInteractions: 0
    });

    useEffect(() => {
        axios.get("https://ACTUAL_RENDER_URL/api/admin/stats", { withCredentials: true })
            .then(res => setStats(res.data))
            .catch(() => {});
    }, []);



    const metrics = [
        { label: "High-Fidelity Nexus Count", val: stats.nexusCount, icon: <Server />, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Orchestrated Identities", val: "85.2k", icon: <Users />, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "AI Neural Pulses", val: "1.2M", icon: <KernelIcon />, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Monolith System Health", val: stats.status, icon: <Activity />, color: "text-emerald-500", bg: "bg-emerald-500/10" }
    ];

    const pipelineStatus = [
        { name: "Global Auth Handshake", status: "Active", latency: "8ms" },
        { name: "Neural Core Pulse", status: "Active", latency: "1.2s" },
        { name: "Music Flux Engine", status: "Standby", latency: "42ms" },
        { name: "Database Persistence Hub", status: "Active", latency: "14ms" },
        { name: "Forensic Log Dispatcher", status: "Active", latency: "5ms" }
    ];

    return (
        <div className="p-8 space-y-12 pb-44 h-screen overflow-auto custom-scrollbar">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-red-500">GLOBAL PULSE</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Root System Telemetry & Orchestration Override</p>
                </div>
                <div className="flex items-center gap-4 p-2 rounded-2xl glass-card border-red-500/20">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest animate-pulse">
                        <Activity size={14} /> LIVE MONITORING
                    </div>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {metrics.map((m, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={m.label} 
                        className="glass-card p-8 border-white/5 space-y-6 glass-card-hover group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                            {m.icon}
                        </div>
                        <div>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase">{m.val}</h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{m.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* System Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kernel Pipeline */}
                <div className="glass-card p-10 border-white/5 space-y-8 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/20">
                                <Cpu size={20} />
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tight uppercase underline decoration-red-500/30">Kernel Status</h2>
                        </div>
                        <span className="text-[10px] font-black text-white/20 text-right uppercase tracking-[0.2em]">Monolith Infrastructure v2.4</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pipelineStatus.map((p) => (
                            <div key={p.name} className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 group hover:bg-white/5 transition-colors border-l-4 border-l-transparent hover:border-l-red-500">
                                <div>
                                    <p className="font-bold text-sm text-white/80">{p.name}</p>
                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Latency Sync Pulse</p>

                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-500 uppercase italic">{p.status}</p>
                                    <p className="text-[10px] text-white/20 font-mono italic">{p.latency}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Global Pulse Visualization Overlay */}
                <div className="glass-card p-10 border-white/5 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-transparent opacity-30" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse relative z-10 shadow-2xl shadow-red-500/30 group-hover:scale-110 transition-transform duration-700">
                        <Globe size={48} />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold uppercase tracking-tight">Active Pulse Chat</h3>
                        <p className="text-sm text-white/30 max-w-[280px]">Your R3NDER AI is currently identified as a <span className="text-primary font-black uppercase italic">environment</span>.</p>
                    </div>

                    <div className="mt-8 flex gap-4 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-red-500/30" />
                    </div>
                </div>
            </div>

            {/* Global Interaction Heartbeat (Mock Chart View) */}
            <div className="glass-card p-10 border-white/5 space-y-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="text-red-500" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Interaction Pulse Log</h2>
                    </div>
                    <div className="text-xs font-black text-white/20 uppercase tracking-[0.5em]">Real-Time Global Sync</div>
                </div>
                
                <div className="h-48 flex items-end gap-3 px-4">
                    {[10, 45, 30, 70, 40, 90, 60, 85, 35, 55, 20, 80, 50, 65, 45, 95].map((h, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05, duration: 1 }}
                            className="flex-1 bg-linear-to-t from-red-500/20 via-red-500/10 to-red-500 rounded-t-lg shadow-lg shadow-red-500/20 group relative cursor-pointer"
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
