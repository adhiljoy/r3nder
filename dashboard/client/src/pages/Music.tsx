import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Play, Pause, SkipForward, SkipBack, Volume2, Music as MusicIcon, 
    ListMusic, Shuffle, Repeat, Activity, Radio, Cpu, ShieldAlert,
    RefreshCw, Zap, Disc, History
} from "lucide-react";



interface MusicStatus {
    playing: boolean;
    paused: boolean;
    volume: number;
    track?: {
        title: string;
        author: string;
        duration: string;
        thumbnail: string;
        url: string;
        progress: number;
        totalSeconds: number;
        requestedBy?: string;
    };
    queue: { title: string; duration: string; requestedBy?: string }[];
    metrics: {
        retries: number;
        fallbacks: number;
        failures: number;
    };
}

const Music = () => {
    const { guildId } = useParams();
    const [status, setStatus] = useState<MusicStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [smoothProgress, setSmoothProgress] = useState(0);
    const [logs, setLogs] = useState<any[]>([]);

    
    const progressRef = useRef<number>(0);
    const lastUpdateRef = useRef<number>(Date.now());

    const API_URL = import.meta.env.VITE_API_URL || "https://https://r3nder-api.onrender.com";

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/guild/${guildId}/music`, { withCredentials: true });
            const data = res.data;
            setStatus(data);
            
            if (data.track) {
                progressRef.current = data.track.progress;
                lastUpdateRef.current = Date.now();
                setSmoothProgress(data.track.progress);
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMusicLogs = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/guild/${guildId}/music/logs`, { withCredentials: true });
            setLogs(res.data);
        } catch (error) {
            console.error("Logs failed:", error);
        }
    };

    // Live Polling (3s)
    useEffect(() => {
        fetchStatus();
        fetchMusicLogs();
        const interval = setInterval(() => {
            fetchStatus();
            fetchMusicLogs();
        }, 3000);
        return () => clearInterval(interval);
    }, [guildId]);

    // Smooth Progress Interpolation (100ms)
    useEffect(() => {
        if (!status?.playing || status.paused) return;

        const interval = setInterval(() => {
            const elapsed = (Date.now() - lastUpdateRef.current) / 1000;
            const projected = progressRef.current + elapsed;
            
            if (status.track && projected < status.track.totalSeconds) {
                setSmoothProgress(projected);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [status?.playing, status?.paused]);

    const handleControl = async (action: string, value?: any) => {
        try {
            await axios.post(`${API_URL}/api/guild/${guildId}/music/control`, { action, value }, { withCredentials: true });

            // Optimistic update for UI feel
            if (action === "pause") setStatus(prev => prev ? { ...prev, paused: true } : null);
            if (action === "resume") setStatus(prev => prev ? { ...prev, paused: false } : null);
            if (action === "volume") setStatus(prev => prev ? { ...prev, volume: value } : null);
            
            setTimeout(fetchStatus, 500); // Verify with server
        } catch (error) {
            console.error("Control failed:", error);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    if (loading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-8">
            <div className="relative">
                <div className="w-24 h-24 border-t-2 border-primary rounded-full animate-spin" />
                <div className="absolute inset-2 border-r-2 border-accent rounded-full animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Radio className="text-primary animate-pulse" size={32} />
                </div>
            </div>
            <div className="space-y-1 text-center">
                <p className="text-white/40 font-black tracking-[0.3em] text-[11px] uppercase">R3NDER Kernel Sync</p>
                <p className="text-[10px] text-white/10 font-bold uppercase">Establishing Bit-Perfect Link</p>
            </div>
        </div>
    );

    if (!status?.playing) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="h-[60vh] flex flex-col items-center justify-center gap-8"
            >
                <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <MusicIcon className="text-white/10 group-hover:text-primary group-hover:scale-110 transition-all duration-500" size={48} />
                </div>
                <div className="text-center max-w-sm space-y-4">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">The Void Awaits</h2>
                    <p className="text-white/30 text-sm font-medium">The high-fidelity audio engine is currently in standby. Use <span className="text-primary font-bold">/play</span> in Discord to prime the kernel.</p>
                </div>
            </motion.div>
        );
    }

    const { track, queue, paused, volume, metrics } = status;

    return (
        <div className="relative min-h-[90vh]">
            {/* Dynamic Ambient Background */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={track?.thumbnail}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{ 
                        backgroundImage: `url(${track?.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(120px) saturate(2)'
                    }}
                />
            </AnimatePresence>

            <div className="relative z-10 space-y-12 pb-24">
                {/* Header Stats */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Sonic Ops</h1>
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                Kernel v2.0 Live
                            </span>
                        </div>
                        <p className="text-white/40 font-medium text-lg">Real-time cluster oversight and audio orchestration.</p>
                    </div>

                    <div className="flex items-stretch gap-2">
                        {[
                            { label: 'Retries', value: metrics.retries, icon: RefreshCw, color: 'text-orange-400' },
                            { label: 'Fallbacks', value: metrics.fallbacks, icon: Zap, color: 'text-yellow-400' },
                            { label: 'Failures', value: metrics.failures, icon: ShieldAlert, color: 'text-red-500' }
                        ].map((stat, i) => (
                            <div key={i} className="px-6 py-3 bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 min-w-[100px]">
                                <stat.icon className={`${stat.color} opacity-50`} size={14} />
                                <span className="text-xl font-bold leading-none">{stat.value}</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Main Core - Player */}
                    <div className="xl:col-span-8 flex flex-col gap-8">
                        <div className="p-8 lg:p-14 glass-card relative overflow-hidden group min-h-[500px] flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-8 flex items-center gap-4 z-20">
                                <Activity className="text-primary/40 animate-pulse" />
                                <div className="h-6 w-px bg-white/5" />
                                <div className="flex items-center gap-2">
                                    <Cpu className="text-white/20" size={16} />
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Neural Sync</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start z-10">
                                {/* Thumbnail Cluster */}
                                <div className="relative group/thumb scale-95 hover:scale-100 transition-transform duration-700 shrink-0">
                                    <div className="absolute -inset-8 bg-primary/20 blur-[80px] rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative z-10">
                                        <img 
                                            src={track?.thumbnail} 
                                            alt="Cover"
                                            className="w-64 h-64 lg:w-80 lg:h-80 rounded-[3rem] object-cover shadow-2xl relative z-10"
                                        />
                                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center z-20 group-hover/thumb:rotate-12 transition-transform duration-500">
                                            <Disc className="text-primary animate-spin-slow" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-12 w-full text-center md:text-left">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                <Radio size={14} /> Origin Stream
                                            </span>
                                            <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                                                <RefreshCw size={14} /> HQ Link Active
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter leading-tight line-clamp-2">
                                                {track?.title}
                                            </h2>
                                            <p className="text-white/40 text-xl lg:text-2xl font-bold tracking-tight">
                                                {track?.author}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Core */}
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="flex items-center justify-between text-[11px] font-black text-white/20 uppercase tracking-widest">
                                            <span>{formatTime(smoothProgress)}</span>
                                            <div className="flex items-center gap-2">
                                                <Activity size={12} className="text-primary animate-pulse" />
                                                <span>Live Matrix</span>
                                            </div>
                                            <span>{track?.duration}</span>
                                        </div>
                                        <div 
                                            className="h-3 md:h-4 bg-white/5 rounded-2xl p-1 relative overflow-hidden border border-white/5 group/bar cursor-pointer"
                                        >
                                            <motion.div 
                                                className="h-full bg-linear-to-r from-primary via-premium to-accent bg-size-[400%_100%] animate-gradient rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] relative"
                                                initial={false}
                                                animate={{ width: `${(smoothProgress / (track?.totalSeconds || 1)) * 100}%` }}
                                                transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                                            >
                                                <div className="absolute top-0 right-0 bottom-0 w-8 bg-linear-to-r from-transparent to-white/20" />
                                            </motion.div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-white/10 flex items-center justify-center overflow-hidden">
                                                <span className="text-[10px] font-black italic">R</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            Initiated by <span className="text-white/60">{track?.requestedBy || "Core Logic"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Control Complex */}
                            <div className="pt-12 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
                                <div className="flex items-center justify-center gap-8 lg:gap-14">
                                    <motion.button whileHover={{ rotate: 15 }} onClick={() => handleControl("shuffle")} className="text-white/20 hover:text-primary transition-colors"><Shuffle size={24} /></motion.button>
                                    <motion.button whileHover={{ x: -2 }} className="text-white/20 hover:text-white transition-colors opacity-50 cursor-not-allowed"><SkipBack size={32} /></motion.button>
                                    
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleControl(paused ? "resume" : "pause")}
                                        className="w-24 h-24 rounded-4xl bg-white text-black flex items-center justify-center shadow-2xl shadow-primary/30 transition-all group/play"
                                    >
                                        {paused ? <Play fill="currentColor" size={40} className="ml-1" /> : <Pause fill="currentColor" size={40} />}
                                    </motion.button>

                                    <motion.button whileHover={{ x: 2 }} onClick={() => handleControl("skip")} className="text-white/20 hover:text-white transition-colors"><SkipForward size={32} /></motion.button>
                                    <motion.button whileHover={{ rotate: -15 }} onClick={() => handleControl("stop")} className="text-white/20 hover:text-red-500 transition-colors"><Repeat size={24} /></motion.button>
                                </div>

                                <div className="flex items-center gap-6 bg-black/40 px-8 py-5 rounded-4xl border border-white/5 w-full lg:w-72 group/vol backdrop-blur-xl">
                                    <Volume2 className="text-white/20 group-hover/vol:text-primary transition-colors" size={20} />
                                    <input 
                                        type="range"
                                        min="0"
                                        max="150"
                                        value={volume}
                                        onChange={(e) => handleControl("volume", parseInt(e.target.value))}
                                        className="flex-1 accent-primary h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                                    />
                                    <span className="text-[10px] font-black text-white/20 tracking-widest">{volume}%</span>
                                </div>
                            </div>

                            {/* Synthetic Spectral Visualizer */}
                            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-0.5 px-4 h-32 pointer-events-none opacity-20">
                                {[...Array(64)].map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        className="flex-1 bg-primary rounded-t-full"
                                        animate={{ 
                                            height: paused ? 4 : [8, Math.random() * 80 + 10, 8],
                                            opacity: paused ? 0.2 : [0.3, 0.8, 0.3]
                                        }}
                                        transition={{ 
                                            duration: 0.8 + Math.random(), 
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Secondary Core - Queue */}
                    <div className="xl:col-span-4 flex flex-col gap-6">
                        <div className="glass-card flex flex-col h-full min-h-[640px] relative overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                        <ListMusic className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tight">Sonic Queue</h3>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{queue.length} Tracks In Transit</p>
                                    </div>
                                </div>
                                <Activity size={20} className="text-white/10" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                                {queue.map((song, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={i} 
                                        className="p-5 rounded-2.5xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all flex items-center gap-5 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                                            <span className="text-[10px] font-black text-white/20 group-hover:text-primary transition-colors">/0{i+1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-base truncate tracking-tight group-hover:text-primary transition-colors">{song.title}</p>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                                <span className="text-[9px] font-black uppercase tracking-widest">{song.duration}</span>
                                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                                <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[100px]">{song.requestedBy || "Core"}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {queue.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center gap-6 py-32">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 animate-spin-slow" />
                                            <MusicIcon className="absolute inset-0 m-auto text-white/10" size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-[10px] uppercase tracking-widest text-white/20">Pipeline Empty</p>
                                            <p className="text-[9px] text-white/10 uppercase mt-1">Awaiting New Sonic Commands</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-white/2 border-t border-white/5">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleControl("stop")}
                                    className="w-full py-5 rounded-2.5xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3"
                                >
                                    <Zap size={16} />
                                    Terminate Kernel Session
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session History - Music Logs */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 space-y-8"
                >
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2.5xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <History className="text-primary" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tight">Sonic Audit Trail</h3>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Historical Sequence Monitoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Track ID & Title</th>
                                    <th className="px-6 py-4">Execution Source</th>
                                    <th className="px-6 py-4">Initiator (Requester)</th>
                                    <th className="px-6 py-4 text-right">Sequence Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/2">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{log.event.replace("MUSIC_", "")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 max-w-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                                    <MusicIcon size={16} className="text-white/20" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate leading-none mb-1.5">{log.trackTitle}</p>
                                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-tighter truncate">{log.trackUrl || 'METADATA_MISSING'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg inline-flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{log.source || "Weblink"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                    <span className="text-[9px] font-black text-primary">{log.username?.charAt(0).toUpperCase() || 'U'}</span>
                                                </div>
                                                <span className="text-sm font-bold text-white/60">{log.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="text-xs font-bold text-white/40 tracking-tight">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                            <div className="text-[9px] font-black text-white/10 uppercase tracking-tighter mt-1">{new Date(log.timestamp).toLocaleDateString()}</div>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-[10px] font-black uppercase text-white/10 tracking-[0.3em]">No Recorded Operations Detected In Sequence Buffer</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(139, 92, 246, 0.1); 
                    border-radius: 10px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: rgba(139, 92, 246, 0.3); 
                }
            `}} />
        </div>
    );
};

export default Music;
