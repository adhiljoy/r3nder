import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { 
    Play, Pause, SkipForward, SkipBack, Volume2, Music as MusicIcon, 
    ListMusic, Shuffle, Repeat 
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

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/guild/${guildId}/music`, { withCredentials: true });
            setStatus(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // 3s live polling
        return () => clearInterval(interval);
    }, [guildId]);

    const handleControl = async (action: string, value?: any) => {
        try {
            await axios.post(`http://localhost:3001/api/guild/${guildId}/music/control`, { action, value }, { withCredentials: true });
            fetchStatus();
        } catch (error) {
            console.error("Control failed:", error);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-white/40 font-bold tracking-widest text-[10px] uppercase">Syncing Sonic Core v2.0</p>
            </div>
        </div>
    );

    if (!status?.playing) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <MusicIcon className="text-white/20 group-hover:text-primary transition-colors duration-500" size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black italic tracking-tighter">SILENCE IS GOLDEN</h3>
                    <p className="text-white/40 max-w-xs mx-auto">The audio cluster is currently idle. Start a session from Discord using <span className="text-primary">/play</span>.</p>
                </div>
            </div>
        );
    }

    const { track, queue, paused, volume, metrics } = status;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-5xl font-black tracking-tight leading-none italic">SONIC OPS</h2>
                    <p className="text-white/40 text-lg font-medium">Global music sync and kernel monitoring.</p>
                </div>
                
                {/* Elite Debug Panel */}
                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl">
                    <div className="px-4 border-r border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Retries</p>
                        <p className="text-xl font-bold text-orange-400">{metrics.retries}</p>
                    </div>
                    <div className="px-4 border-r border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Fallbacks</p>
                        <p className="text-xl font-bold text-yellow-400">{metrics.fallbacks}</p>
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Failures</p>
                        <p className="text-xl font-bold text-red-500">{metrics.failures}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Now Playing Panel */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="glass-card overflow-hidden relative group">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="p-8 md:p-12 space-y-10">
                            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <img 
                                        src={track?.thumbnail} 
                                        className="w-56 h-56 rounded-4xl object-cover shadow-2xl relative z-10 hover:scale-105 transition-transform duration-700" 
                                        alt="Thumbnail"
                                    />
                                </div>
                                
                                <div className="flex-1 space-y-6 z-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                            <span className="flex items-center gap-2 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                Live Sync
                                            </span>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Req: {track?.requestedBy || "System"}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black leading-tight line-clamp-2">{track?.title}</h3>
                                            <p className="text-white/40 text-xl font-semibold">{track?.author}</p>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between font-black text-[10px] text-white/20 tracking-tighter uppercase px-1">
                                            <span>{track?.progress}</span>
                                            <span>{track?.duration}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                            <div 
                                                className="h-full bg-linear-to-r from-primary via-accent to-primary bg-size-[200%_auto] animate-gradient transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
                                                style={{ width: `${(track?.progress! / track?.totalSeconds!) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-4 z-10 relative">
                                <div className="flex items-center gap-8 lg:gap-12">
                                    <button onClick={() => handleControl("shuffle")} className="text-white/20 hover:text-white transition-all transform hover:rotate-12"><Shuffle size={24} /></button>
                                    <button className="text-white/20 hover:text-white transition-all transform hover:-translate-x-1"><SkipBack size={32} /></button>
                                    <button 
                                        onClick={() => handleControl(paused ? "resume" : "pause")}
                                        className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 group/play"
                                    >
                                        {paused ? <Play className="ml-1" fill="currentColor" size={32} /> : <Pause fill="currentColor" size={32} />}
                                    </button>
                                    <button onClick={() => handleControl("skip")} className="text-white/20 hover:text-white transition-all transform hover:translate-x-1"><SkipForward size={32} /></button>
                                    <button onClick={() => handleControl("stop")} className="text-white/20 hover:text-red-500 transition-all"><Repeat size={24} /></button>
                                </div>
                                
                                <div className="flex items-center gap-6 bg-white/5 px-8 py-4 rounded-3xl border border-white/5 w-full md:w-auto">
                                    <Volume2 size={24} className="text-white/40" />
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="150" 
                                        value={volume}
                                        onChange={(e) => handleControl("volume", parseInt(e.target.value))}
                                        className="flex-1 md:w-32 accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue View */}
                <div className="space-y-6">
                    <div className="glass-card flex flex-col h-[640px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                        
                        <div className="p-8 border-b border-white/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <ListMusic className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tight">QUEUED ITEMS</h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{queue.length} Tracks Syncing</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10 custom-scrollbar">
                            {queue.map((song, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group/item flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                                        <span className="text-xs font-black text-white/20 group-hover/item:text-primary transition-colors italic">0{i+1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base truncate tracking-tight">{song.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{song.duration}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest truncate">{song.requestedBy || "Core"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {queue.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-white/10 italic py-20">
                                    <ListMusic size={40} />
                                    <p className="font-black text-sm tracking-widest uppercase">Kernel Queue Clear</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white/5 border-t border-white/5 z-10">
                            <button 
                                onClick={() => handleControl("stop")}
                                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-black text-[10px] uppercase tracking-widest transition-all duration-500"
                            >
                                TERMINATE AUDIO SESSION
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Music;
