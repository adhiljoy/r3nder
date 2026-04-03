"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const Skeleton_1 = __importDefault(require("../components/ui/Skeleton"));
const socket_io_client_1 = require("socket.io-client");
/**
 * ServerLogs - Specifically for Guild Admins to see their own server's activity.
 */
const ServerLogs = () => {
    const { guildId } = (0, react_router_dom_1.useParams)();
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [page, setPage] = (0, react_1.useState)(1);
    const [totalPages, setTotalPages] = (0, react_1.useState)(1);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [isLive, setIsLive] = (0, react_1.useState)(false);
    const [search, setSearch] = (0, react_1.useState)("");
    const [type, setType] = (0, react_1.useState)("");
    const fetchLogs = () => {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
        axios_1.default.get(`${API_URL}/api/guild/${guildId}/logs`, {
            params: { page, search, type },
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
    (0, react_1.useEffect)(() => {
        fetchLogs();
        // Socket.IO Real-time Logic
        const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
        const socket = (0, socket_io_client_1.io)(API_URL, {
            query: { guildId }
        });
        socket.on("connect", () => setIsLive(true));
        socket.on("disconnect", () => setIsLive(false));
        socket.on("new_log", (log) => {
            // Only prepend if we are on page 1 and no specific filters are active
            if (page === 1 && !search && !type) {
                setLogs((prev) => [log, ...prev].slice(0, 50));
                setTotal((prev) => prev + 1);
            }
        });
        return () => {
            socket.disconnect();
        };
    }, [page, type, search, guildId]);
    const handleSearch = (e) => {
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
    const getTypeColor = (type) => {
        switch (type) {
            case "message": return "text-blue-400 bg-blue-400/10";
            case "command": return "text-purple-400 bg-purple-400/10";
            case "mod": return "text-red-400 bg-red-400/10";
            case "ai": return "text-emerald-400 bg-emerald-400/10";
            case "system": return "text-yellow-400 bg-yellow-400/10";
            default: return "text-white/40 bg-white/5";
        }
    };
    return (<framer_motion_1.motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <framer_motion_1.motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <lucide_react_1.Terminal className="text-primary" size={32}/>
                        </div>
                        Server Audit Trail
                    </h1>
                    <p className="text-white/40 font-medium italic mt-2">Historical transparency and transaction logs for this guild</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-white/3 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                        {isLive && (<framer_motion_1.motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"/>)}
                        <span className={isLive ? "text-emerald-400" : ""}>{isLive ? "Live Stream" : "Static History"}</span>
                        <div className="w-px h-3 bg-white/10 mx-1"/>
                        Total Records: <span className="text-white/60">{total.toLocaleString()}</span>
                    </div>
                </div>
            </framer_motion_1.motion.div>

            {/* Filter Bar */}
            <framer_motion_1.motion.div variants={itemVariants} className="glass-card p-6 flex flex-wrap items-center gap-4 border border-white/5">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[300px] group">
                    <lucide_react_1.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18}/>
                    <input type="text" placeholder="Search forensic events..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"/>
                </form>

                <div className="flex items-center gap-3">
                    <select className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none text-white/60 focus:border-primary/50 transition-all font-bold" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All Streams</option>
                        <option value="message">Messages</option>
                        <option value="command">Commands</option>
                        <option value="mod">Moderation</option>
                        <option value="system">Security & Bot</option>
                    </select>

                    <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchLogs} className="premium-btn py-3 px-6 shadow-primary/20">
                        <lucide_react_1.Filter size={18}/>
                        Update
                    </framer_motion_1.motion.button>
                </div>
            </framer_motion_1.motion.div>

            {/* Logs Table */}
            <framer_motion_1.motion.div variants={itemVariants} className="glass-card rounded-4xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/3 text-[10px] uppercase font-black tracking-[0.2em] text-white/20 border-b border-white/5">
                            <tr>
                                <th className="px-10 py-6">Action Insight</th>
                                <th className="px-8 py-6">Subject</th>
                                <th className="px-8 py-6">Operational Metadata</th>
                                <th className="px-10 py-6 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            <framer_motion_1.AnimatePresence mode="popLayout">
                                {loading ? (Array(7).fill(0).map((_, i) => (<tr key={`sk-${i}`}>
                                            <td className="px-10 py-6"><Skeleton_1.default height={40} className="w-40"/></td>
                                            <td className="px-8 py-6"><Skeleton_1.default height={20} className="w-32"/></td>
                                            <td className="px-8 py-6"><Skeleton_1.default height={20} className="w-full"/></td>
                                            <td className="px-10 py-6"><Skeleton_1.default height={20} className="w-24 ml-auto"/></td>
                                        </tr>))) : logs.map((log) => (<framer_motion_1.motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/3 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getTypeColor(log.type)}`}>
                                                    {log.type === "message" && <lucide_react_1.MessageSquare size={18}/>}
                                                    {log.type === "command" && <lucide_react_1.Zap size={18}/>}
                                                    {log.type === "mod" && <lucide_react_1.Shield size={18}/>}
                                                    {log.type === "system" && <lucide_react_1.Terminal size={18}/>}
                                                    {log.type === "error" && <lucide_react_1.AlertCircle size={18}/>}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black uppercase text-white tracking-widest leading-none group-hover:text-primary transition-colors">
                                                        {log.action?.replace(/_/g, " ") || log.type}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter mt-1">{log.type} ops</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                                                <div className="p-1.5 bg-white/5 rounded-lg">
                                                    <lucide_react_1.User size={12} className="opacity-40"/>
                                                </div>
                                                <span className="font-mono tracking-tighter">{log.userId || "OS_SYSTEM"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-sm">
                                            <div className="text-sm text-white/70 leading-relaxed font-outfit truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:z-10 relative">
                                                {log.content}
                                            </div>
                                            {log.changes && (<div className="mt-3 space-y-1.5 bg-background/40 p-4 rounded-2xl border border-white/5">
                                                    {Object.entries(log.changes).map(([key, value]) => (<div key={key} className="text-[10px] font-mono flex items-center gap-3">
                                                            <span className="text-primary font-black uppercase tracking-tighter bg-primary/10 px-1.5 rounded">{key}</span>
                                                            <span className="text-white/20 line-through decoration-white/10">{String(value.old)}</span>
                                                            <lucide_react_1.ChevronRight size={10} className="text-white/10"/>
                                                            <span className="text-white/80 font-bold">{String(value.new)}</span>
                                                        </div>))}
                                                </div>)}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="text-xs font-black text-white/60 tracking-tighter">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-white/20 tracking-widest mt-1">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </div>
                                        </td>
                                    </framer_motion_1.motion.tr>))}
                            </framer_motion_1.AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <div className="p-10 bg-white/3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                        Sync Buffer Index: <span className="text-white/50">0x{(page * 50).toString(16).toUpperCase()}</span> • Stream Coverage: <span className="text-white/50">{((page / totalPages) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={page === 1} onClick={() => setPage(page - 1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-5 text-white transition-all border border-white/5">
                            <lucide_react_1.ChevronLeft size={24}/>
                        </framer_motion_1.motion.button>
                        
                        <div className="px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-black text-primary tracking-widest">
                            PAGE {page} / {totalPages}
                        </div>

                        <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={page === totalPages} onClick={() => setPage(page + 1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-5 text-white transition-all border border-white/5">
                            <lucide_react_1.ChevronRight size={24}/>
                        </framer_motion_1.motion.button>
                    </div>
                </div>
            </framer_motion_1.motion.div>
        </framer_motion_1.motion.div>);
};
exports.default = ServerLogs;
