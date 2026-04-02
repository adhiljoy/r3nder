import { useState, useEffect } from "react";


import { useParams, Link } from "react-router-dom";

import { 
    Zap, Shield, Music, Activity, 
    Save, Sparkles, MessageSquare, 
    RefreshCw, Volume2, Globe, Clock, 
    BarChart3, Lock, Users, Bell,
    Settings as SettingsIcon, Trash2, Plus
} from "lucide-react";



import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Dashboard = () => {
    const { guildId, tab } = useParams();
    const [activeTab, setActiveTab] = useState(tab || "ai");
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // SYNC ACTIVE TAB WITH URL PULSE
    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
                const res = await axios.get(`${API_URL}/api/guild/${guildId}/settings`, { withCredentials: true });
                setSettings(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Nexus Sync Failed:", err);
            }
        };
        fetchSettings();
    }, [guildId]);

    const saveSettings = async () => {
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
            await axios.post(`${API_URL}/api/guild/${guildId}/settings`, settings, { withCredentials: true });
            setMessage("Settings synced successfully! 🌌");

            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("❌ Failed to sync settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin shadow-lg shadow-primary/20" />
        </div>
    );

    const tabs = [
        { id: "ai", label: "AI Control", icon: <Zap size={18} /> },
        { id: "moderation", label: "Moderation", icon: <Shield size={18} /> },
        { id: "music", label: "Music Flux", icon: <Music size={18} /> },
        { id: "analytics", label: "Nexus Stats", icon: <Activity size={18} /> },
        { id: "settings", label: "Executive", icon: <SettingsIcon size={18} /> }
    ];

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                            <Sparkles size={20} />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase underline decoration-primary/30">Executive Suite</h1>
                    </div>
                    <p className="text-white/30 font-medium uppercase text-[10px] tracking-[0.2em]">Orchestrating Nexus Cluster: <span className="text-white/60">{guildId}</span></p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={saveSettings}
                        disabled={saving}
                        className="premium-btn py-3 px-10 flex items-center gap-3"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? "SYNCING..." : "SYNC SETTINGS"}
                    </button>
                    {message && <span className="text-xs font-bold text-primary animate-pulse">{message}</span>}
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-4 p-2 rounded-2xl glass-card border-white/5 w-fit">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        to={`/app/${guildId}/${tab.id === "ai" ? "" : tab.id}`}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-500 font-bold uppercase tracking-widest text-[10px] ${
                            activeTab === tab.id 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "text-white/40 hover:text-white/80 hover:bg-white/5"
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </Link>
                ))}
            </div>


            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                >
                    {activeTab === "ai" && (
                        <>
                            <div className="glass-card p-10 space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">AI Autopilot</h2>
                                    <p className="text-xs text-white/30 uppercase font-black tracking-widest">Neural Kernel Configuration</p>
                                </div>
                                <div className="space-y-6">
                                    {/* AI Enable Toggle */}
                                    <div className="p-6 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-colors">
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm">System Activation</p>
                                            <p className="text-xs text-white/30 font-medium">Bypass text analysis for all nexus interactions</p>
                                        </div>
                                        <button 
                                            onClick={() => setSettings({ ...settings, aiAutopilot: { ...settings.aiAutopilot, enabled: !settings.aiAutopilot?.enabled } })}
                                            className={`w-14 h-8 rounded-full transition-all duration-500 relative flex items-center px-1 ${settings.aiAutopilot?.enabled ? "bg-primary" : "bg-white/10"}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-md ${settings.aiAutopilot?.enabled ? "translate-x-6" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                    {/* Personality Mode */}
                                    <div className="p-6 rounded-2xl bg-white/3 border border-white/5 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2"><Globe size={12} /> Personality Pulse Mode</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {["coder", "mod", "assistant"].map(p => (
                                                <button 
                                                    key={p}
                                                    onClick={() => setSettings({ ...settings, aiAutopilot: { ...settings.aiAutopilot, personality: p } })}
                                                    className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all duration-300 ${settings.aiAutopilot?.personality === p ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10 hover:text-white"}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 bg-linear-to-br from-primary/5 to-transparent">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                                    <MessageSquare size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">Active Pulse Chat</h3>
                                    <p className="text-sm text-white/30 max-w-[280px]">Your R3NDER AI is currently identified as a <span className="text-primary font-black uppercase italic">{settings.aiAutopilot?.personality}</span> environment.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "moderation" && (
                        <>
                            <div className="glass-card p-10 space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">Shield Logic</h2>
                                    <p className="text-xs text-white/30 uppercase font-black tracking-widest">Automated Protection Suite</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Lock size={18} /></div>
                                            <div>
                                                <p className="text-sm font-bold">Auto-Mod Core</p>
                                                <p className="text-[10px] text-white/30 font-black uppercase">Identify Distress Pulses</p>
                                            </div>
                                        </div>
                                        <button className="premium-btn-outline py-2 px-4 text-[10px]">ENABLE</button>
                                    </div>
                                    <div className="p-5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Bell size={18} /></div>
                                            <div>
                                                <p className="text-sm font-bold">Audit Event Log</p>
                                                <p className="text-[10px] text-white/30 font-black uppercase">Push Pulse to Channel</p>
                                            </div>
                                        </div>
                                        <input className="w-32 bg-background border border-white/5 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-primary" placeholder="Channel ID" />
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card p-10 bg-linear-to-br from- emerald-500/5 to-transparent space-y-6">
                                <h3 className="text-lg font-bold">Active Shield Profile</h3>
                                <div className="space-y-3">
                                    {["Link Filter", "Spam Pulse Control", "Explicit Sync Guard"].map(item => (
                                        <div key={item} className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-bold text-white/60">{item}</span>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">PROTECTED</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "music" && (
                        <>
                            <div className="glass-card p-10 space-y-10 lg:col-span-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Music Flux</h2>
                                        <p className="text-xs text-white/30 uppercase font-black tracking-widest leading-relaxed">High-Fidelity Audio Synchronization</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/3 p-4 rounded-2xl border border-white/5">
                                        <Volume2 className="text-primary" />
                                        <input 
                                            type="range" 
                                            className="w-44 accent-primary" 
                                            onChange={(e) => setSettings({ ...settings, music: { ...settings.music, volume: parseInt(e.target.value) } })}
                                        />
                                        <span className="text-xs font-black text-primary w-8">{settings.music?.volume}%</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {["Auto-Play Sync", "Voice Pulse Lock", "SoundCloud Direct"].map(feature => (
                                        <div key={feature} className="p-6 rounded-2xl glass-card border-white/5 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/20 transition-all cursor-pointer group">
                                            <div className="p-4 rounded-full bg-white/3 text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><Music size={24} /></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">{feature}</p>
                                            <span className="text-[8px] font-black italic text-primary/50">PREMIUM READY</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "analytics" && (
                        <div className="glass-card p-10 lg:col-span-2 space-y-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase underline decoration-primary/30">Network Insight</h2>
                                    <p className="text-xs text-white/30 uppercase font-black tracking-widest leading-relaxed">Real-time Telemetry Pulse</p>
                                </div>

                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                    <button className="px-4 py-2 rounded-lg bg-primary text-white text-[10px] font-black uppercase">24H</button>
                                    <button className="px-4 py-2 rounded-lg text-white/30 text-[10px] font-black uppercase">7D</button>
                                    <button className="px-4 py-2 rounded-lg text-white/30 text-[10px] font-black uppercase">30D</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                { [
                                    { label: "Pulse Count", val: "12,482", icon: <Activity size={18} />, color: "text-blue-500" },
                                    { label: "AI Response", val: "4.2s", icon: <Clock size={18} />, color: "text-purple-500" },
                                    { label: "Unique Users", val: "842", icon: <Users size={18} />, color: "text-emerald-500" },
                                    { label: "Command Flow", val: "3.1/min", icon: <BarChart3 size={18} />, color: "text-amber-500" }
                                ].map((item) => (
                                    <div key={item.label} className="p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className={`mb-4 w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center ${item.color}`}>{item.icon}</div>
                                        <h3 className="text-2xl font-black italic tracking-tighter">{item.val}</h3>
                                        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{item.label}</p>
                                    </div>
                                ))}

                            </div>
                            <div className="h-64 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center text-white/20 font-black italic uppercase tracking-[0.5em] text-[10px] overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                <div className="flex flex-col items-center gap-4 relative z-10">
                                    <Activity className="animate-pulse" size={48} />
                                    <span>Orchestrating Historical Telemetry...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className="lg:col-span-2 space-y-10">
                            <div className="glass-card p-10 space-y-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">Executive Vault</h2>
                                    <p className="text-xs text-white/30 uppercase font-black tracking-widest">Bot Identity & Event Pulses</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Nickname Pulse */}
                                    <div className="p-6 rounded-2xl bg-white/3 border border-white/5 space-y-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Bot Identity Sync</p>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-bold text-white/60">Server Nickname</label>
                                                <input 
                                                    type="text"
                                                    value={settings.nickname || ""}
                                                    onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
                                                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                                    placeholder="Enter high-fidelity nickname..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Neural Reminders */}
                                    <div className="p-6 rounded-2xl bg-white/3 border border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Neural Reminders</p>

                                            <button 
                                                onClick={() => {
                                                    const reminders = [...(settings.reminders || [])];
                                                    reminders.push({ id: Date.now(), text: "New Pulse Reminder", time: "12:00" });
                                                    setSettings({ ...settings, reminders });
                                                }}
                                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {(settings.reminders || []).map((reminder: any, idx: number) => (
                                                <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 group">
                                                    <div className="flex-1 space-y-1">
                                                        <input 
                                                            className="bg-transparent border-none p-0 text-xs font-bold w-full focus:outline-none" 
                                                            value={reminder.text} 
                                                            onChange={(e) => {
                                                                const reminders = [...settings.reminders];
                                                                reminders[idx].text = e.target.value;
                                                                setSettings({ ...settings, reminders });
                                                            }}
                                                        />
                                                        <p className="text-[10px] text-white/20 uppercase font-black">Sync Time: {reminder.time}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const reminders = settings.reminders.filter((_: any, i: number) => i !== idx);
                                                            setSettings({ ...settings, reminders });
                                                        }}
                                                        className="text-white/10 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!settings.reminders || settings.reminders.length === 0) && (
                                                <p className="text-[10px] text-white/10 italic text-center py-4">No active event pulses detected.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
};


export default Dashboard;
