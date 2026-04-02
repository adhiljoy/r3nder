import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Zap, ShieldAlert, Save, Sparkles, AlertCircle } from "lucide-react";

const AIControl = () => {
    const { guildId } = useParams();
    const [settings, setSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "https://YOUR_RENDER_BACKEND_URL";
        axios.get(`${API_URL}/api/guild/${guildId}/settings`, { withCredentials: true })
            .then(res => setSettings(res.data))
            .catch(console.error);
    }, [guildId]);


    const handleSave = async () => {
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://YOUR_RENDER_BACKEND_URL";
            await axios.post(`${API_URL}/api/guild/${guildId}/settings`, settings, { withCredentials: true });
        } catch (error) {


            alert("Error saving AI settings.");
        } finally {
            setSaving(false);
        }
    };

    if (!settings) return <div className="p-20 text-center text-white/40">Loading AI config...</div>;

    const personalities = [
        { id: "normal", label: "Professional", desc: "Calm, helpful, Siri-style tone." },
        { id: "funny", label: "Witty", desc: "Sarcastic, humorous, uses emojis." },
        { id: "coder", label: "Engineer", desc: "Technical, precise, dev-focused." },
        { id: "strict", label: "Administrator", desc: "Formal, direct, no-nonsense." },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black tracking-tight">AI Control Panel</h2>
                    <p className="text-white/40 text-lg">Manage R3NDER's synthetic intelligence and autopilot behavior.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="premium-btn min-w-[160px]"
                >
                    <Save size={18} />
                    {saving ? "Syncing..." : "Save Config"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 space-y-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-primary" />
                            <h3 className="text-xl font-bold">Autopilot Core</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { id: "enabled", label: "AI Autopilot", desc: "Enable background monitoring and re-engagement.", field: "enabled" },
                                { id: "autoReply", label: "Smart Auto-Reply", desc: "Automatically answer natural language questions.", field: "autoReply" },
                                { id: "mentionResponse", label: "Mention Response", desc: "Reply instantly when the bot is mentioned.", field: "mentionResponse" },
                                { id: "toxicityFilter", label: "Toxicity Shield", desc: "Filter and moderate harmful AI interactions.", field: "toxicityFilter" },
                                { id: "inactiveEngage", label: "Inactivity Monitor", desc: "Re-engage quiet channels automatically.", field: "inactiveEngage" },
                            ].map((toggle) => (
                                <div key={toggle.id} className="flex items-start justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">{toggle.label}</p>
                                        <p className="text-xs text-white/40">{toggle.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.aiAutopilot[toggle.field]}
                                            onChange={(e) => setSettings({
                                                ...settings, 
                                                aiAutopilot: { ...settings.aiAutopilot, [toggle.field]: e.target.checked }
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-premium" />
                            <h3 className="text-xl font-bold">Bot Personality</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personalities.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSettings({
                                        ...settings, 
                                        aiAutopilot: { ...settings.aiAutopilot, personality: p.id }
                                    })}
                                    className={`p-6 rounded-2xl border text-left transition-all duration-300 ${
                                        settings.aiAutopilot.personality === p.id 
                                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                    }`}
                                >
                                    <p className={`font-black text-lg ${settings.aiAutopilot.personality === p.id ? "text-primary" : "text-white"}`}>
                                        {p.label}
                                    </p>
                                    <p className="text-xs text-white/40 mt-1">{p.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="glass-card p-8 bg-linear-to-br from-primary/10 to-transparent border-primary/20 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-primary" />
                            <h4 className="font-bold">Neural Limits</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-white/40">Model Memory</span>
                                    <span>{settings.aiAutopilot.personality === "coder" ? "Extended" : "Standard"}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-primary rounded-full" />
                                </div>
                            </div>
                            <p className="text-[10px] text-white/20 italic">
                                Your current tier (Free) limits AI memory to 10 messages per context. Upgrade to Ultra for 50+ messages.
                            </p>
                        </div>
                        <button className="w-full py-3 rounded-xl bg-white text-black font-black text-sm hover:scale-[1.02] active:scale-95 transition-all">
                            Upgrade to Ultra
                        </button>
                    </div>

                    <div className="glass-card p-8 space-y-4 border-yellow-500/20">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-yellow-500" size={20} />
                            <h4 className="font-bold text-sm">Contextual Awareness</h4>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">
                            R3NDER uses a short-term vector memory to maintain coherence. 
                            If behaviors seem erratic, use `/clearai` in Discord to reset the neural state.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIControl;
