"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const lucide_react_1 = require("lucide-react");
const Subscription = () => {
    const [currentTier, setCurrentTier] = (0, react_1.useState)("free");
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [upgrading, setUpgrading] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const API_URL = import.meta.env.VITE_API_URL || "https://api.r3nder.ai";
        axios_1.default.get(`${API_URL}/api/me`, { withCredentials: true })
            .then(res => setCurrentTier(res.data.premiumTier || "free"))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    const handleUpgrade = async (tier) => {
        setUpgrading(tier);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://api.r3nder.ai";
            await axios_1.default.post(`${API_URL}/api/premium/upgrade`, { tier }, { withCredentials: true });
            setCurrentTier(tier);
            alert(`Level up! You are now a ${tier.toUpperCase()} member.`);
        }
        catch (error) {
            alert("Upgrade failed. Please try again.");
        }
        finally {
            setUpgrading(null);
        }
    };
    if (loading)
        return <div className="p-20 text-center text-white/40">Syncing subscription tokens...</div>;
    const tiers = [
        {
            id: "free",
            name: "Free",
            price: "$0",
            icon: <lucide_react_1.Zap className="text-white/40"/>,
            features: ["Standard AI Model", "10 Message Memory", "Basic Analytics", "Standard Music Controls"],
            color: "border-white/5",
            btn: "Current Plan"
        },
        {
            id: "pro",
            name: "Pro",
            price: "$9.99",
            icon: <lucide_react_1.Sparkles className="text-primary"/>,
            features: ["GPT-4o-mini Model", "20 Message Memory", "Advanced Analytics", "DJ Role Support", "Priority Support"],
            color: "border-primary/50 shadow-lg shadow-primary/10",
            btn: "Upgrade to Pro"
        },
        {
            id: "ultra",
            name: "Ultra",
            price: "$24.99",
            icon: <lucide_react_1.Crown className="text-premium"/>,
            features: ["GPT-4o Full Model", "50+ Message Memory", "Real-time Analytics", "Lossless Music Sync", "Custom AI Personality", "Early Access"],
            color: "border-premium shadow-2xl shadow-premium/20",
            btn: "Upgrade to Ultra"
        }
    ];
    return (<div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/40 mb-4">
                    <lucide_react_1.ShieldCheck size={14} className="text-primary"/>
                    Premium Ecosystem
                </div>
                <h2 className="text-6xl font-black tracking-tighter bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent italic">UNLEASH THE POWER</h2>
                <p className="text-white/40 text-xl max-w-2xl mx-auto">Elevate your Discord experience with high-end AI and enterprise-grade tools.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {tiers.map((tier) => (<div key={tier.id} className={`glass-card p-10 flex flex-col gap-8 relative overflow-hidden group transition-all duration-500 hover:scale-[1.03] ${tier.color}`}>
                        {tier.id === "ultra" && (<div className="absolute top-0 right-0 bg-premium px-6 py-1 rounded-bl-2xl text-[10px] font-black text-black uppercase tracking-widest">
                                Most Powerful
                            </div>)}
                        
                        <div className="flex items-center justify-between">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                {tier.icon}
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black">{tier.price}</p>
                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Per Month</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">{tier.name}</h3>
                            <p className="text-xs text-white/40 leading-relaxed">Perfect for {tier.id === 'free' ? 'small friends groups' : tier.id === 'pro' ? 'growing communities' : 'elite professional servers'}.</p>
                        </div>

                        <div className="flex-1 space-y-4">
                            {tier.features.map((f, i) => (<div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                        <lucide_react_1.Check size={12} className={tier.id === 'free' ? 'text-white/20' : 'text-primary'}/>
                                    </div>
                                    <span className="text-white/60">{f}</span>
                                </div>))}
                        </div>

                        <button disabled={currentTier === tier.id || (upgrading !== null)} onClick={() => handleUpgrade(tier.id)} className={`w-full py-4 rounded-xl font-black text-sm transition-all duration-300 ${currentTier === tier.id
                ? "bg-white/10 text-white/40 cursor-default"
                : tier.id === "ultra"
                    ? "bg-premium-gradient text-black shadow-premium/20 hover:shadow-premium/40"
                    : "bg-white text-black hover:scale-[1.02] active:scale-95"}`}>
                            {upgrading === tier.id ? "Processing..." : currentTier === tier.id ? "Activated" : tier.btn}
                        </button>
                    </div>))}
            </div>

            <div className="max-w-4xl mx-auto glass-card p-10 bg-linear-to-r from-primary/5 to-transparent border-primary/10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-black">Enterprise Licensing?</h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                        Need R3NDER for more than 50 servers or a custom white-label solution? Our team of engineers can build a tailored synthetic framework for your brand.
                    </p>
                </div>
                <button className="px-10 py-4 rounded-xl border border-white/10 hover:bg-white/5 font-black text-sm whitespace-nowrap transition-all">
                    Contact Sales
                </button>
            </div>
        </div>);
};
exports.default = Subscription;
