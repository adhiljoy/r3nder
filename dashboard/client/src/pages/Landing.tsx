import React from "react";
import { motion } from "framer-motion";
import { 
    Cpu, Shield, Activity, Music, BarChart3, 
    ChevronRight, ExternalLink, MessageSquare, 
    Zap, Globe, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import mockup from "../assets/mockup.png";

const Landing = () => {
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Zap size={20} className="text-white" fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">R3NDER</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-white/40 uppercase tracking-widest">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#stats" className="hover:text-white transition-colors">OS Stats</a>
                        <a href="https://github.com/adhiljoy/r3nder" className="hover:text-white transition-colors flex items-center gap-2">
                            Source <ExternalLink size={14} />
                        </a>
                    </div>

                    <Link to="/login" className="premium-btn">
                        Dashboard <ChevronRight size={14} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-20">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        variants={stagger}
                        className="space-y-6"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Sparkles size={12} /> Version 2.0 Intelligent Kernel
                        </motion.div>
                        
                        <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            AI-Powered <br /> 
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Discord Control</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-lg md:text-xl text-white/40 font-medium">
                            Modernize your community with real-time analytics, 
                            intelligent moderation, and SaaS-grade management tools.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-6">
                            <button className="premium-btn py-4 px-10 text-xs">
                                Invite R3NDER <ChevronRight size={16} />
                            </button>
                            <Link to="/login" className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">
                                Open Dashboard
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Hero Preview */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-20 relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 group-hover:bg-primary/30 transition-all duration-700" />
                        <div className="glass-card p-2 md:p-4 rotate-x-12 rotate-z-0 perspective-1000 shadow-2xl overflow-hidden">
                            <img 
                                src={mockup} 
                                alt="R3NDER Dashboard Mockup" 
                                className="w-full h-auto rounded-2xl object-cover shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Stats Section */}
            <section id="stats" className="py-20 border-t border-white/5 bg-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {[
                        { label: "Total Servers", value: "1,240+", icon: <Globe size={24} /> },
                        { label: "Commands Executed", value: "2.4M", icon: <Zap size={24} /> },
                        { label: "Active Users", value: "850K+", icon: <Users size={24} /> }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-4">
                            <div className="w-12 h-12 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Everything you need <br /> to scale.</h2>
                        <p className="text-white/40 font-medium italic">A modular OS designed for modular servers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { 
                                title: "AI Intelligence", 
                                desc: "Advanced LLM-driven chat and toxicity management with context memory.", 
                                icon: <Cpu />, 
                                color: "from-purple-500/20 to-transparent" 
                            },
                            { 
                                title: "Audit & Logging", 
                                desc: "Real-time forensic audit logs pushed instantly to your dashboard via WebSockets.", 
                                icon: <Shield />, 
                                color: "from-blue-500/20 to-transparent" 
                            },
                            { 
                                title: "Global Analytics", 
                                desc: "Monitor Peak times, activity heatmaps, and command usage trends visually.", 
                                icon: <BarChart3 />, 
                                color: "from-emerald-500/20 to-transparent" 
                            },
                            { 
                                title: "Premium Music", 
                                desc: "High-fidelity audio engine with real-time persistent player controls.", 
                                icon: <Music />, 
                                color: "from-rose-500/20 to-transparent" 
                            },
                            { 
                                title: "Risk Scoring", 
                                desc: "Identify toxic actors before they strike with automated risk assessments.", 
                                icon: <Activity />, 
                                color: "from-yellow-500/20 to-transparent" 
                            },
                            { 
                                title: "Social Connect", 
                                desc: "Engage your community with XP leveling and personalized AI interactions.", 
                                icon: <MessageSquare />, 
                                color: "from-cyan-500/20 to-transparent" 
                            }
                        ].map((feat, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -8 }}
                                className="glass-card p-8 space-y-6 relative overflow-hidden group"
                            >
                                <div className={`absolute inset-0 bg-linear-to-br ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary relative z-10 transition-transform group-hover:scale-110">
                                    {React.cloneElement(feat.icon as any, { size: 28 })}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium">{feat.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto glass-card p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-accent/10 opacity-50" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Ready to deploy?</h2>
                        <p className="max-w-xl mx-auto text-white/40 font-medium">Join 1,200+ servers enjoying the R3NDER experience. Scale without limits.</p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button className="premium-btn py-4 px-10">Invite now</button>
                            <Link to="/login" className="px-10 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest border border-white/10">Configure Dashboard</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <Zap size={20} className="text-primary" />
                            <span className="text-xl font-black tracking-tighter uppercase font-mono">R3NDER<span className="text-primary opacity-50">.OS</span></span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Designed & Architected by adhiljoy</p>
                    </div>

                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <a href="#" className="hover:text-white transition-colors">Documentation</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="https://github.com/adhiljoy/r3nder" className="hover:text-white transition-colors">GitHub</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer">
                            <Globe size={18} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer">
                            <Shield size={18} />
                        </div>
                    </div>
                </div>
                <div className="mt-10 text-center text-[8px] font-black uppercase tracking-[0.5em] opacity-10">
                    Proprietary Algorithm • R3NDER Kernel v2.0 • 2026
                </div>
            </footer>
        </div>
    );
};

const Users = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export default Landing;
