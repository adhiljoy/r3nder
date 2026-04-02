import { useState, useEffect } from "react";
import axios from "axios";
import { 
    Zap, Sparkles, Shield, Music, 
    ArrowRight, Globe, Cpu, MessageSquare,
    Server, Users, Terminal
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const Landing = () => {
    const [statsData, setStatsData] = useState({ totalServers: 0, totalUsers: 0, commandsProcessed: 0 });

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
        axios.get(`${API_URL}/api/stats`).then(res => setStatsData(res.data)).catch(() => {});
    }, []);


    const stats = [
        { label: "Synced Servers", value: statsData.totalServers.toString(), icon: <Server size={20} /> },
        { label: "Orchestrated Users", value: statsData.totalUsers.toLocaleString() + "+", icon: <Users size={20} /> },
        { label: "Autonomous Actions", value: statsData.commandsProcessed.toLocaleString(), icon: <Terminal size={20} /> }
    ];


    const features = [
        { 
            title: "AI Autopilot", 
            description: "Advanced GPT-4o driven personality sync for your community. Autonomous chatting and mentions.",
            icon: <Cpu className="text-primary" size={24} /> 
        },
        { 
            title: "Music Flux Engine", 
            description: "High-fidelity SoundCloud and YouTube synchronization with zero-latency playback.",
            icon: <Music className="text-accent" size={24} /> 
        },
        { 
            title: "Shield Moderation", 
            description: "Advanced role-based access and automated moderation log pulses for zero-distress community care.",
            icon: <Shield className="text-emerald-500" size={24} /> 
        },
        { 
            title: "Global Analytics", 
            description: "Real-time telemetry and pulse tracking for server activity, member growth, and AI usage.",
            icon: <Zap className="text-amber-500" size={24} /> 
        }
    ];

    return (
        <div className="relative overflow-x-hidden pt-20">
            {/* Background Glow Mesh */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 glow-mesh opacity-20" />
            <div className="absolute top-[30%] -right-20 glow-mesh opacity-10 bg-accent/30" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Hero Section */}
                <header className="flex flex-col items-center text-center space-y-10 py-20 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-2 rounded-full glass-card border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary"
                    >
                        <Sparkles size={14} /> NEW AI KERNEL 2.0 IS LIVE
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] text-gradient"
                    >
                        Orchestrate <br />
                        <span className="text-primary-gradient">Your Empire</span> <br />
                        with R3NDER
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg lg:text-xl text-white/40 max-w-2xl font-medium tracking-tight"
                    >
                        High-fidelity Discord automation, AI-driven personality sync, and premium music orchestration. 
                        Join the high-speed SaaS ecosystem designed for modern communities.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-6 pt-4"
                    >
                        <a href="https://ACTUAL_RENDER_URL/auth/discord" className="premium-btn group">
                            ADD TO DISCORD <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <Link to="/app" className="premium-btn-outline">
                            OPEN DASHBOARD
                        </Link>
                    </motion.div>
                </header>

                {/* Stats Section */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20"
                >
                    {stats.map((stat) => (

                        <div key={stat.label} className="glass-card p-8 flex items-center gap-6 group hover:border-white/20 transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                {stat.icon}
                            </div>
                            <div>
                                <h3 className="text-4xl font-black italic tracking-tighter uppercase">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.section>

                {/* Features Section */}
                <section className="py-20 lg:py-32 space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase">High-Fidelity Features</h2>
                        <p className="text-white/30 font-medium">Engineered for performance. Built for community scale.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                key={feature.title}
                                className="glass-card p-10 space-y-6 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                            >
                                <div className="w-12 h-12 bg-white/3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                    {feature.icon}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">{feature.title}</h3>
                                    <p className="text-sm text-white/30 leading-relaxed font-medium">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-20 border-t border-white/5 mt-20 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <Zap className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase">R3NDER</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
                        &copy; 2026 R3NDER Core. All high-fidelity pulses reserved.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-white/20 hover:text-white transition-colors"><Globe size={20} /></a>
                        <a href="#" className="text-white/20 hover:text-white transition-colors"><MessageSquare size={20} /></a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Landing;
