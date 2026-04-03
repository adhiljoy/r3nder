"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const AuthContext_1 = require("../../context/AuthContext");
const Topbar = ({ onMenuClick }) => {
    const { guildId } = (0, react_router_dom_1.useParams)();
    const { user } = (0, AuthContext_1.useAuth)();
    const [currentGuild, setCurrentGuild] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        axios_1.default.get("https://r3nder-api.onrender.com/api/guilds", { withCredentials: true })
            .then(res => {
            const found = res.data.find((g) => g.id === guildId);
            if (found)
                setCurrentGuild(found);
        })
            .catch(console.error);
    }, [guildId]);
    return (<header className="h-20 backdrop-blur-xl bg-background/60 border-b border-white/5 p-6 px-4 md:px-10 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4 md:gap-8">
                {/* Mobile Menu Toggle */}
                <button onClick={onMenuClick} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white transition-colors">
                    <lucide_react_1.Menu size={20}/>
                </button>
                {/* Search Bar */}
                <div className="relative group w-80">
                    <lucide_react_1.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18}/>
                    <input type="text" placeholder="Search settings..." className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all duration-300"/>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Server Selector */}
                <div className="relative group">
                    <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-all duration-300 group">
                        {currentGuild?.icon ? (<img src={`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png`} className="w-8 h-8 rounded-lg" alt="Server Icon"/>) : (<div className="w-8 h-8 bg-linear-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shadow-lg shadow-primary/20">
                                {guildId ? (currentGuild?.name?.charAt(0) || "?") : "G"}
                            </div>)}
                        <span className="font-bold text-sm tracking-tight">{guildId ? (currentGuild?.name || "Select Server") : "R3NDER Global Core"}</span>
                        <lucide_react_1.ChevronDown size={16} className="text-white/20 group-hover:text-white transition-colors"/>
                    </button>
                    
                    {/* Dropdown would go here - placeholder for brevity */}
                </div>

                <div className="w-px h-8 bg-white/10 mx-2"/>

                {/* Notifications & Premium */}
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-not-allowed">
                        <lucide_react_1.Bell size={20}/>
                    </button>

                    <react_router_dom_1.Link to={guildId ? `/app/${guildId}/subscription` : "/portal"} className="bg-premium-gradient px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg shadow-premium/20 hover:scale-[1.02] active:scale-95 transition-transform">
                        <lucide_react_1.Crown size={14}/>
                        {user?.premiumTier === "ultra" ? "Ultra Access" : "Upgrade"}
                    </react_router_dom_1.Link>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-4 ml-4">
                    <img src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`} className="w-10 h-10 rounded-xl" alt="Avatar"/>
                </div>
            </div>
        </header>);
};
exports.default = Topbar;
