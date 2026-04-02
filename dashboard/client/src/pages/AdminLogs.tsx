import { useState, useEffect } from "react";
import axios from "axios";
import { Terminal, Shield, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";


const AdminLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // 5s pulse
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
            const res = await axios.get(`${API_URL}/api/admin/logs`, { withCredentials: true });
            setLogs(res.data);
            setLoading(false);
        } catch (error) {

            console.error("Forensic Pulse Failed:", error);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-red-500 rounded-full animate-spin shadow-lg shadow-red-500/20" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 h-screen overflow-auto pb-44 custom-scrollbar">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-red-500">GLOBAL BOT LOGS</h1>
                <p className="text-white/40 font-medium">Root forensic audit across all active nexus clusters</p>
            </div>

            {/* Terminal Interface */}
            <div className="glass-card border-red-500/10 overflow-hidden bg-black/60">
                <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-white/3">
                    <Terminal size={16} className="text-red-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">SYSTEM PULSE (LIVE)</p>
                </div>

                <div className="p-4 font-mono text-xs space-y-3">
                    {logs.length === 0 ? (
                        <div className="text-white/20 italic animate-pulse">Waiting for high-fidelity pulse from nexus...</div>
                    ) : (
                        logs.map((log, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={log._id || i} 
                                className="flex gap-4 group hover:bg-white/5 p-2 rounded-lg transition-colors border-l-2 border-transparent hover:border-red-500/30"
                            >
                                <span className="text-white/20 whitespace-nowrap"><Clock size={12} className="inline mr-2" /> {new Date(log.createdAt).toLocaleTimeString()}</span>
                                
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                        log.type === "AI" ? "bg-purple-500/10 text-purple-400" : 
                                        log.type === "COMMAND" ? "bg-blue-500/10 text-blue-400" :
                                        "bg-red-500/10 text-red-400"
                                    }`}>
                                        {log.type || "SYSTEM"}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-white/80 leading-relaxed"><span className="text-red-500/30 font-black">#</span> {log.content}</p>
                                    <div className="flex items-center gap-4 text-[10px] text-white/30 truncate max-w-lg">
                                        {log.guildName && <span className="flex items-center gap-1"><Shield size={10} /> {log.guildName}</span>}
                                        {log.userName && <span className="flex items-center gap-1"><Zap size={10} /> {log.userName}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;
