import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
    Palette, Settings, Save, UserCircle, 
    Bell, Zap, Sparkles, RefreshCw,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const GeneralSettings = () => {
    const { guildId } = useParams();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Command States
    const [nickUserId, setNickUserId] = useState("");
    const [newNick, setNewNick] = useState("");
    const [remChannelId, setRemChannelId] = useState("");
    const [remMessage, setRemMessage] = useState("");
    const [remDelay, setRemDelay] = useState(1);

    useEffect(() => {
        fetchSettings();
    }, [guildId]);

    const fetchSettings = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
            const res = await axios.get(`${API_URL}/api/guild/${guildId}/settings`, { withCredentials: true });
            setSettings(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
            await axios.post(`${API_URL}/api/guild/${guildId}/settings`, settings, { withCredentials: true });
            setMessage("Settings saved successfully! ✨");
            setTimeout(() => setMessage(""), 3000);
            window.location.reload(); // Refresh to apply broad UI changes like theme
        } catch (error) {
            setMessage("❌ Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const runCommand = async (command: string, data: any) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
            await axios.post(`${API_URL}/api/guild/${guildId}/command`, { command, data }, { withCredentials: true });
            setMessage(`🚀 ${command.replace("_", " ")} executed!`);

            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage("❌ Command failed. Check bot permissions.");
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">GENERAL SETTINGS</h1>
                    <p className="text-white/40 font-medium">Customize your server's core OS and remote actions</p>
                </div>
                <button 
                    onClick={saveSettings}
                    disabled={saving}
                    className="premium-btn py-3 px-8 flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold flex items-center gap-2"
                    >
                        <Sparkles size={16} /> {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Theme & Appearance */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Theme & Accent</h2>
                            <p className="text-xs text-white/40 uppercase font-black tracking-widest">Dashboard Customization</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Accent Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Primary Accent Color</label>
                            <div className="flex flex-wrap gap-4">
                                {["#5865F2", "#EB459E", "#FEE75C", "#2ECC71", "#E67E22", "#9B59B6"].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, accentColor: color } })}
                                        className={`w-10 h-10 rounded-xl transition-all duration-300 ${settings.appearance?.accentColor === color ? "scale-110 shadow-lg ring-2 ring-white/20" : "opacity-40 hover:opacity-100"}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input 
                                    type="color" 
                                    value={settings.appearance?.accentColor || "#5865F2"}
                                    onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, accentColor: e.target.value } })}
                                    className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Theme Mode */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Theme Mode</label>
                            <div className="grid grid-cols-3 gap-4">
                                {["glass", "dark", "amoled"].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, themeMode: mode } })}
                                        className={`p-4 rounded-xl border transition-all duration-300 capitalize text-sm font-bold ${settings.appearance?.themeMode === mode ? "bg-white/10 border-primary text-white shadow-lg" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. OS Control Actions (Commands) */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">OS Control Center</h2>
                            <p className="text-xs text-white/40 uppercase font-black tracking-widest">Remote Guild Operations</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Nickname Command */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                                <UserCircle size={14} /> Change Member Nickname
                            </div>
                            <div className="flex gap-4">
                                <input 
                                    placeholder="User ID (e.g. 123...)"
                                    value={nickUserId}
                                    onChange={(e) => setNickUserId(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                />
                                <input 
                                    placeholder="New Nickname"
                                    value={newNick}
                                    onChange={(e) => setNewNick(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                />
                                <button 
                                    onClick={() => runCommand("CHANGE_NICKNAME", { userId: nickUserId, nickname: newNick })}
                                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/10"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Reminder Command */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                                <Bell size={14} /> Push Remote Reminder
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <input 
                                        placeholder="Channel ID"
                                        value={remChannelId}
                                        onChange={(e) => setRemChannelId(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                    />
                                    <input 
                                        type="number"
                                        placeholder="Min"
                                        value={remDelay}
                                        onChange={(e) => setRemDelay(parseInt(e.target.value))}
                                        className="w-20 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <input 
                                        placeholder="Reminder Message..."
                                        value={remMessage}
                                        onChange={(e) => setRemMessage(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                    />
                                    <button 
                                        onClick={() => runCommand("SET_REMINDER", { channelId: remChannelId, message: remMessage, delayMinutes: remDelay })}
                                        className="p-3 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-all shadow-lg shadow-accent/10"
                                    >
                                        <Clock size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Core Bot Settings */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Bot Configuration</h2>
                            <p className="text-xs text-white/40 uppercase font-black tracking-widest">Kernel Core Options</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">Command Prefix</p>
                                <p className="text-xs text-white/40">Custom trigger for text commands</p>
                            </div>
                            <input 
                                value={settings.prefix}
                                onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                                className="w-16 bg-background border border-white/5 rounded-lg px-2 py-1 text-center font-black text-primary focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">Log Channel Override</p>
                                <p className="text-xs text-white/40">Target ID for system audits</p>
                            </div>
                            <input 
                                placeholder="Channel ID"
                                value={settings.logChannelId || ""}
                                onChange={(e) => setSettings({ ...settings, logChannelId: e.target.value })}
                                className="w-32 bg-background border border-white/5 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
