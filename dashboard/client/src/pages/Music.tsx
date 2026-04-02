import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { 
    Play, Pause, SkipForward, SkipBack, Volume2, Music as MusicIcon, 
    ListMusic, Shuffle, Repeat, ExternalLink 
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
    };
    queue: { title: string; duration: string }[];
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
        const interval = setInterval(fetchStatus, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [guildId]);

    const handleControl = async (action: string, value?: any) => {
        try {
            await axios.post(`http://localhost:3001/api/guild/${guildId}/music/control`, { action, value }, { withCredentials: true });
            fetchStatus();
        } catch (error) {
            alert("Control failed. Bot may be disconnected.");
        }
    };

    if (loading) return <div className="p-20 text-center text-white/40">Syncing with sonic core...</div>;

    if (!status?.playing) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <MusicIcon className="text-white/20" size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black italic">SILENCE IS GOLDEN</h3>
                    <p className="text-white/40">No music is currently playing in this server.</p>
                </div>
                <button className="premium-btn px-8">
                    Open Player in Discord
                </button>
            </div>
        );
    }

    const { track, queue, paused, volume } = status;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight">Music Sync</h2>
                <p className="text-white/40 text-lg">Real-time control and queue management.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Now Playing Card */}
                <div className="lg:col-span-2 glass-card p-1 items-center bg-linear-to-br from-primary/20 to-transparent border-primary/20">
                    <div className="p-8 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="relative group shrink-0">
                                <img 
                                    src={track?.thumbnail} 
                                    className="w-48 h-48 rounded-2xl object-cover shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500" 
                                    alt="Thumbnail"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                    <ExternalLink className="text-white" size={24} />
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">Now Playing</span>
                                <div>
                                    <h3 className="text-3xl font-black leading-tight line-clamp-2">{track?.title}</h3>
                                    <p className="text-white/40 text-lg font-medium">{track?.author}</p>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <span className="text-xs text-white/20 font-bold">{track?.progress}</span>
                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[200px]">
                                        <div 
                                            className="h-full bg-linear-to-r from-primary to-accent transition-all duration-1000" 
                                            style={{ width: `${(track?.progress! / track?.totalSeconds!) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-white/40 font-bold">{track?.duration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row items-center gap-8 pt-4">
                            <div className="flex items-center gap-10">
                                <button onClick={() => handleControl("shuffle")} className="text-white/20 hover:text-white transition-colors"><Shuffle size={20} /></button>
                                <button className="text-white/20 hover:text-white transition-colors"><SkipBack size={24} /></button>
                                <button 
                                    onClick={() => handleControl(paused ? "resume" : "pause")}
                                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10"
                                >
                                    {paused ? <Play fill="currentColor" /> : <Pause fill="currentColor" />}
                                </button>
                                <button onClick={() => handleControl("skip")} className="text-white/20 hover:text-white transition-colors"><SkipForward size={24} /></button>
                                <button className="text-white/20 hover:text-white transition-colors"><Repeat size={20} /></button>
                            </div>
                            
                            <div className="flex-1 md:block hidden h-px bg-white/5 mx-4" />

                            <div className="flex items-center gap-4 w-40">
                                <Volume2 size={20} className="text-white/20" />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="150" 
                                    value={volume}
                                    onChange={(e) => handleControl("volume", parseInt(e.target.value))}
                                    className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue Card */}
                <div className="glass-card flex flex-col h-[500px]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ListMusic className="text-primary" />
                            <h3 className="text-xl font-bold">Upcoming</h3>
                        </div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{queue.length} Songs</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {queue.map((song, i) => (
                            <div key={i} className="p-4 rounded-xl hover:bg-white/5 transition-colors group flex items-center gap-4">
                                <span className="text-xs font-black text-white/10 group-hover:text-primary transition-colors">0{i+1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{song.title}</p>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-wider">{song.duration}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6">
                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 font-bold text-xs transition-colors">
                            Clear Queue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Music;
