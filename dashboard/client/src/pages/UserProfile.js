"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const axios_1 = __importDefault(require("axios"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const Skeleton_1 = __importDefault(require("../components/ui/Skeleton"));
const UserProfile = () => {
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [birthday, setBirthday] = (0, react_1.useState)("");
    const [reminderMessage, setReminderMessage] = (0, react_1.useState)("");
    const [reminderTime, setReminderTime] = (0, react_1.useState)("");
    const fetchProfile = () => {
        axios_1.default.get("https://r3nder-api.onrender.com/api/user/profile", { withCredentials: true })
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
    (0, react_1.useEffect)(() => {
        fetchProfile();
    }, []);
    const updateBirthday = (e) => {
        e.preventDefault();
        axios_1.default.post("https://r3nder-api.onrender.com/api/user/birthday", { birthday }, { withCredentials: true })
            .then(() => fetchProfile());
    };
    const addReminder = (e) => {
        e.preventDefault();
        axios_1.default.post("https://r3nder-api.onrender.com/api/user/reminder", { message: reminderMessage, time: reminderTime }, { withCredentials: true })
            .then(() => {
            setReminderMessage("");
            setReminderTime("");
            fetchProfile();
        });
    };
    const deleteReminder = (id) => {
        axios_1.default.delete(`https://r3nder-api.onrender.com/api/user/reminder/${id}`, { withCredentials: true })
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
    if (loading)
        return (<div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center gap-4">
                <Skeleton_1.default height={64} width={64} className="rounded-2xl"/>
                <div className="space-y-2">
                    <Skeleton_1.default height={32} width={200}/>
                    <Skeleton_1.default height={20} width={300}/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton_1.default height={300}/>
                <Skeleton_1.default className="md:col-span-2" height={400}/>
            </div>
        </div>);
    return (<framer_motion_1.motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-12">
            <framer_motion_1.motion.div variants={itemVariants} className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/20 transition-transform hover:scale-110">
                    <lucide_react_1.User size={32}/>
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Your Profile</h1>
                    <p className="text-white/40 font-medium italic">Manage your personal settings and R3NDER intelligence</p>
                </div>
            </framer_motion_1.motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Birthday Section */}
                <framer_motion_1.motion.div variants={itemVariants} className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-pink-500/10 rounded-2xl">
                            <lucide_react_1.Cake className="text-pink-500" size={20}/>
                        </div>
                        <h2 className="text-xl font-bold text-white">Birthday</h2>
                    </div>
                    <form onSubmit={updateBirthday} className="space-y-6">
                        <div className="relative group">
                            <lucide_react_1.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18}/>
                            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-outfit"/>
                        </div>
                        <framer_motion_1.motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="premium-btn w-full shadow-primary/30">
                            Update Profile
                        </framer_motion_1.motion.button>
                    </form>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] text-center leading-relaxed">
                            Audit Logic: Admin transparency enforced for data consistency
                        </p>
                    </div>
                </framer_motion_1.motion.div>

                {/* Reminders Section */}
                <framer_motion_1.motion.div variants={itemVariants} className="md:col-span-2 glass-card p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                <lucide_react_1.Bell className="text-yellow-500" size={20}/>
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
                            <input type="text" placeholder="What should I remember?" value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-primary/40"/>
                        </div>
                        <div className="sm:col-span-3 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 ml-2">Timing Offset</label>
                            <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-primary/40"/>
                        </div>
                        <framer_motion_1.motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} className="h-12 w-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 ml-auto sm:ml-0">
                            <lucide_react_1.Plus size={24}/>
                        </framer_motion_1.motion.button>
                    </form>

                    <div className="space-y-4">
                        <framer_motion_1.AnimatePresence>
                            {profile?.reminders?.length === 0 ? (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border-2 border-dashed border-white/5 rounded-4xl flex flex-col items-center gap-4">
                                    <div className="p-4 bg-white/5 rounded-full text-white/10">
                                        <lucide_react_1.Bell size={40}/>
                                    </div>
                                    <div className="text-white/20 text-sm font-bold tracking-widest uppercase">System Idle • No Active Reminders</div>
                                </framer_motion_1.motion.div>) : (profile?.reminders?.map((rem) => (<framer_motion_1.motion.div key={rem._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} whileHover={{ x: 4 }} className="flex items-center justify-between p-6 bg-white/3 rounded-4xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group">
                                        <div className="flex items-start gap-5">
                                            <div className="mt-2 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.6)]"/>
                                            <div>
                                                <div className="text-md font-bold text-white leading-tight">{rem.message}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-white/30 mt-2 font-black uppercase tracking-widest">
                                                    <lucide_react_1.Calendar size={12} className="opacity-40"/>
                                                    {new Date(rem.time).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <framer_motion_1.motion.button whileHover={{ scale: 1.1, backgroundColor: "#ef4444", color: "#fff" }} onClick={() => deleteReminder(rem._id)} className="p-3 rounded-2xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <lucide_react_1.Trash2 size={18}/>
                                        </framer_motion_1.motion.button>
                                    </framer_motion_1.motion.div>)))}
                        </framer_motion_1.AnimatePresence>
                    </div>
                </framer_motion_1.motion.div>
            </div>

            {/* Admin Audit Badge */}
            <framer_motion_1.motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-6 rounded-4xl bg-accent/5 border border-accent/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16"/>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        <lucide_react_1.Shield size={24}/>
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-accent">Forensic OS Audit Active</div>
                        <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest mt-1">Global Data Synchronization Protocol Enabled</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10 bg-white/3 px-6 py-3 rounded-2xl border border-white/5">
                    <lucide_react_1.CheckCircle2 size={18} className="text-accent animate-pulse"/>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Verified & Secure</span>
                </div>
            </framer_motion_1.motion.div>
        </framer_motion_1.motion.div>);
};
exports.default = UserProfile;
