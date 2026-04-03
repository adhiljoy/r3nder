"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lucide_react_1 = require("lucide-react");
const AuthContext_1 = require("../../context/AuthContext");
const framer_motion_1 = require("framer-motion");
const Navbar = ({ isCore = false, onMenuClick }) => {
    const { user } = (0, AuthContext_1.useAuth)();
    return (<nav className="h-28 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 relative bg-white/1 backdrop-blur-3xl z-40">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-8 flex-1">
                <button onClick={onMenuClick} className="lg:hidden p-3 bg-white/3 rounded-xl text-white/30 hover:text-white transition-colors">
                    <lucide_react_1.Menu size={20}/>
                </button>
                
                <div className="hidden lg:flex items-center gap-4 bg-white/3 px-6 py-3 rounded-2xl border border-white/5 w-80 group hover:border-white/15 transition-all duration-500 shadow-inner">
                    <lucide_react_1.Search className="text-white/20 group-hover:text-white/50 transition-colors" size={18}/>
                    <input type="text" placeholder="Search settings..." className="bg-transparent border-none text-sm font-medium text-white/60 focus:outline-none placeholder:text-white/10 w-full"/>
                </div>
            </div>

            {/* Right: Actions + User Pulse */}
            <div className="flex items-center gap-6">
                {!isCore && (<framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="premium-btn py-2.5 px-6 flex items-center gap-2 group">
                        <lucide_react_1.Sparkles size={16} className="text-white animate-pulse"/>
                        <span className="text-[10px] font-black uppercase tracking-widest">UPGRADE PULSE</span>
                    </framer_motion_1.motion.button>)}

                <div className="h-10 w-px bg-white/5 sm:block"/>

                <div className="flex items-center gap-4">
                    {/* Notification Pulse */}
                    <button className="p-3 bg-white/3 rounded-xl text-white/20 hover:text-white hover:bg-white/8 transition-all duration-500 relative group border border-white/5">
                        <lucide_react_1.Bell size={20}/>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping opacity-60"/>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/40"/>
                    </button>

                    <div className="flex items-center gap-4 pl-4 border-l border-white/5">

                        <div className="text-right">
                            <p className="text-xs font-black uppercase text-white mb-0.5">{isCore ? "R3NDER Global Core" : "R3NDER User"}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isCore ? "text-red-500/50" : "text-primary/50"}`}>
                                {isCore ? "ROOT ACTIVATED" : "Authorized Member"}
                            </p>
                        </div>
                        <framer_motion_1.motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-12 h-12 rounded-2xl p-0.5 bg-linear-to-br from-white/10 to-white/5 shadow-2xl relative overflow-hidden group">
                            <img src={user.avatar} className="w-full h-full rounded-2xl relative z-10" alt="Identity"/>
                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity"/>
                        </framer_motion_1.motion.div>
                    </div>
                </div>
            </div>
        </nav>);
};
exports.default = Navbar;
