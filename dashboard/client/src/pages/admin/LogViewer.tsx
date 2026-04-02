import { useEffect, useState } from "react";
import axios from "axios";
import { 
    Search, Filter, ChevronLeft, ChevronRight, 
    MessageSquare, Zap, Shield, Terminal, AlertCircle, 
    Database, User as UserIcon, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../../components/ui/Skeleton";

const LogViewer = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [guildId, setGuildId] = useState("");

    const fetchLogs = () => {
        setLoading(true);
        axios.get("https://r3nder-api.onrender.com/api/admin/logs", {
            params: { page, search, type, guildId },
            withCredentials: true
        })
        .then(res => {
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
            setTotal(res.data.total);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchLogs();
    }, [page, type, guildId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { duration: 0.3, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "message": return "text-blue-400 bg-blue-400/10";
            case "command": return "text-purple-400 bg-purple-400/10";
            case "mod": return "text-red-400 bg-red-400/10";
            case "ai": return "text-emerald-400 bg-emerald-400/10";
            case "system": return "text-yellow-400 bg-yellow-400/10";
            default: return "text-white/40 bg-white/5";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "critical": return <AlertCircle size={14} className="text-red-500" />;
            case "error": return <AlertCircle size={14} className="text-orange-500" />;
            case "warn": return <AlertCircle size={14} className="text-yellow-500" />;
            default: return <Shield size={14} className="text-emerald-500 opacity-30" />;
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Database className="text-primary" size={32} />
                        </div>
                        Global Log Explorer
                    </h1>
                    <p className="text-white/40 font-medium italic mt-2">Full audit trail across all clusters and shards</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-white/3 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                        Live Buffer: <span className="text-white/60">{total.toLocaleString()} Ops</span>
                    </div>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <motion.div variants={itemVariants} className="glass-card p-6 flex flex-wrap items-center gap-4 border border-white/5">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[300px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search forensic packet data..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-12 py-3 bg-white/3"
                    />
                </form>

                <div className="flex items-center gap-3 flex-wrap">
                    <select 
                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none text-white/60 focus:border-primary/50 transition-all font-bold"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">All Streams</option>
                        <option value="message">Messages</option>
                        <option value="command">Commands</option>
                        <option value="mod">Moderation</option>
                        <option value="ai">AI Deep Learning</option>
                        <option value="system">Kernel Events</option>
                    </select>

                    <input 
                        type="text" 
                        placeholder="Guild Filter ID" 
                        value={guildId}
                        onChange={(e) => setGuildId(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none text-white/60 focus:border-primary/50 transition-all font-mono font-bold w-48"
                    />

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchLogs} 
                        className="premium-btn py-3 px-6 shadow-primary/20"
                    >
                        <Filter size={18} />
                        Update
                    </motion.button>
                </div>
            </motion.div>

            {/* Logs Table */}
            <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/3 text-[10px] uppercase font-black tracking-[0.2em] text-white/20 border-b border-white/5">
                            <tr>
                                <th className="px-10 py-6">Signal Profile</th>
                                <th className="px-8 py-6">Operation Origin</th>
                                <th className="px-8 py-6">Actor/Subject</th>
                                <th className="px-8 py-6">Data Payload</th>
                                <th className="px-10 py-6 text-right">Sequence Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    Array(7).fill(0).map((_, i) => (
                                        <tr key={`sk-${i}`}>
                                            <td className="px-10 py-6"><Skeleton height={40} className="w-40" /></td>
                                            <td className="px-8 py-6"><Skeleton height={20} className="w-24" /></td>
                                            <td className="px-8 py-6"><Skeleton height={40} className="w-32" /></td>
                                            <td className="px-8 py-6"><Skeleton height={20} className="w-full" /></td>
                                            <td className="px-10 py-6"><Skeleton height={20} className="w-24 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : logs.map((log) => (
                                    <motion.tr 
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-white/3 transition-all group"
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getTypeColor(log.type)}`}>
                                                    {log.type === "message" && <MessageSquare size={18} />}
                                                    {log.type === "command" && <Zap size={18} />}
                                                    {log.type === "mod" && <Shield size={18} />}
                                                    {log.type === "ai" && <Zap size={18} />}
                                                    {log.type === "system" && <Terminal size={18} />}
                                                    {log.type === "error" && <AlertCircle size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black uppercase text-white tracking-widest leading-none flex items-center gap-2 group-hover:text-primary transition-colors">
                                                        {getPriorityIcon(log.priority)}
                                                        {log.type}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter mt-1">{log.priority || "standard"} priority</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 group-hover:bg-primary/5 transition-colors">
                                            <div className="text-[11px] font-black text-primary uppercase tracking-tighter leading-none">
                                                {log.action?.replace(/_/g, " ") || "UNSPECIFIED"}
                                            </div>
                                            <div className="text-[8px] text-white/20 font-mono mt-1">PID_{log._id.slice(-8).toUpperCase()}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                                                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                                                        <UserIcon size={12} className="opacity-40" />
                                                    </div>
                                                    <span className="font-mono tracking-tighter">{log.userId || "OS_KERN"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                                                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                                                        <Layers size={12} className="opacity-40" />
                                                    </div>
                                                    <span className="font-mono tracking-tighter truncate max-w-[120px]">{log.guildId || "NET_GLOB"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-sm">
                                            <div className="text-sm text-white/70 leading-relaxed font-outfit line-clamp-2 group-hover:line-clamp-none transition-all">
                                                {log.content}
                                            </div>
                                            {log.changes && (
                                                <div className="mt-3 space-y-1.5 bg-background/40 p-4 rounded-2xl border border-white/5">
                                                    {Object.entries(log.changes).map(([key, value]: any) => (
                                                        <div key={key} className="text-[10px] font-mono flex items-center gap-3">
                                                            <span className="text-primary font-black uppercase tracking-tighter bg-primary/10 px-1.5 rounded">{key}</span>
                                                            <span className="text-white/20 line-through decoration-white/10">{String(value.old)}</span>
                                                            <ChevronRight size={10} className="text-white/10" />
                                                            <span className="text-white/80 font-bold">{String(value.new)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="text-xs font-black text-white/60 tracking-tighter">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-white/20 tracking-widest mt-1">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-10 bg-white/3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                        Kernel Page Offset: <span className="text-white/50">0x{(page * 50).toString(16).toUpperCase()}</span> • Index Coverage: <span className="text-white/50">{((page / totalPages) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={page === 1} 
                            onClick={() => setPage(page - 1)} 
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-5 text-white transition-all border border-white/5"
                        >
                            <ChevronLeft size={24} />
                        </motion.button>
                        
                        <div className="px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-black text-primary tracking-widest">
                            PAGE {page} / {totalPages}
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={page === totalPages} 
                            onClick={() => setPage(page + 1)} 
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-5 text-white transition-all border border-white/5"
                        >
                            <ChevronRight size={24} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LogViewer;
