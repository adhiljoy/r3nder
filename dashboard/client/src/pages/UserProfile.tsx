import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
    Cake, Bell, Trash2, Plus, Calendar, 
    User as UserIcon, Shield, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/ui/Skeleton";

const UserProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [birthday, setBirthday] = useState("");
    const [reminderMessage, setReminderMessage] = useState("");
    const [reminderTime, setReminderTime] = useState("");

    const fetchProfile = () => {
        axios.get("https://https://r3nder-api.onrender.com/api/user/profile", { withCredentials: true })
            .then(res => {
                setProfile(res.data);
                if (res.data.birthday) {
                    setBirthday(new Date(res.data.birthday).toISOString().split("T")[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const updateBirthday = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post("https://https://r3nder-api.onrender.com/api/user/birthday", { birthday }, { withCredentials: true })
            .then(() => fetchProfile());
    };

    const addReminder = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post("https://https://r3nder-api.onrender.com/api/user/reminder", { message: reminderMessage, time: reminderTime }, { withCredentials: true })
            .then(() => {
                setReminderMessage("");
                setReminderTime("");
                fetchProfile();
            });
    };

    const deleteReminder = (id: string) => {
        axios.delete(`https://https://r3nder-api.onrender.com/api/user/reminder/${id}`, { withCredentials: true })
            .then(() => fetchProfile());
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center gap-4">
                <Skeleton height={64} width={64} className="rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton height={32} width={200} />
                    <Skeleton height={20} width={300} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton height={300} />
                <Skeleton className="md:col-span-2" height={400} />
            </div>
        </div>
    );

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-12"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/20 transition-transform hover:scale-110">
                    <UserIcon size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Your Profile</h1>
                    <p className="text-white/40 font-medium italic">Manage your personal settings and R3NDER intelligence</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Birthday Section */}
                <motion.div variants={itemVariants} className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-pink-500/10 rounded-2xl">
                            <Cake className="text-pink-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Birthday</h2>
                    </div>
                    <form onSubmit={updateBirthday} className="space-y-6">
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="date" 
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-outfit"
                            />
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="premium-btn w-full shadow-primary/30"
                        >
                            Update Profile
                        </motion.button>
                    </form>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] text-center leading-relaxed">
                            Audit Logic: Admin transparency enforced for data consistency
                        </p>
                    </div>
                </motion.div>

                {/* Reminders Section */}
                <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                <Bell className="text-yellow-500" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Active Reminders</h2>
                        </div>
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                            {profile?.reminders?.length || 0} Queued
                        </span>
                    </div>

                    <form onSubmit={addReminder} className="grid grid-cols-1 sm:grid-cols-7 gap-4 items-end bg-white/3 p-8 rounded-4xl border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="sm:col-span-3 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 ml-2">Task Insight</label>
                            <input 
                                type="text"
                                placeholder="What should I remember?"
                                value={reminderMessage}
                                onChange={(e) => setReminderMessage(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-primary/40"
                            />
                        </div>
                        <div className="sm:col-span-3 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 ml-2">Timing Offset</label>
                            <input 
                                type="datetime-local"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-primary/40"
                            />
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="h-12 w-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 ml-auto sm:ml-0"
                        >
                            <Plus size={24} />
                        </motion.button>
                    </form>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {profile?.reminders?.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 border-2 border-dashed border-white/5 rounded-4xl flex flex-col items-center gap-4"
                                >
                                    <div className="p-4 bg-white/5 rounded-full text-white/10">
                                        <Bell size={40} />
                                    </div>
                                    <div className="text-white/20 text-sm font-bold tracking-widest uppercase">System Idle • No Active Reminders</div>
                                </motion.div>
                            ) : (
                                profile?.reminders?.map((rem: any) => (
                                    <motion.div 
                                        key={rem._id} 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        whileHover={{ x: 4 }}
                                        className="flex items-center justify-between p-6 bg-white/3 rounded-4xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-start gap-5">
                                            <div className="mt-2 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
                                            <div>
                                                <div className="text-md font-bold text-white leading-tight">{rem.message}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-white/30 mt-2 font-black uppercase tracking-widest">
                                                    <Calendar size={12} className="opacity-40" />
                                                    {new Date(rem.time).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.1, backgroundColor: "#ef4444", color: "#fff" }}
                                            onClick={() => deleteReminder(rem._id)}
                                            className="p-3 rounded-2xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Admin Audit Badge */}
            <motion.div 
                variants={itemVariants}
                className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-6 rounded-4xl bg-accent/5 border border-accent/10 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        <Shield size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-accent">Forensic OS Audit Active</div>
                        <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest mt-1">Global Data Synchronization Protocol Enabled</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10 bg-white/3 px-6 py-3 rounded-2xl border border-white/5">
                    <CheckCircle2 size={18} className="text-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Verified & Secure</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfile;
