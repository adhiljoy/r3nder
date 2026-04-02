import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuildSelector = () => {
    const { user, logout } = useAuth();
    const [guilds, setGuilds] = useState<any[]>([]);

    useEffect(() => {
        axios.get("http://localhost:3001/api/guilds", { withCredentials: true })
            .then(res => setGuilds(res.data))
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen w-full bg-background p-8 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Select a Server</h1>
                        <p className="text-white/40">Select which server you'd like to manage.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold">{user?.username}</p>
                            <button onClick={logout} className="text-red-400 text-sm hover:underline">Logout</button>
                        </div>
                        <img 
                            src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`} 
                            className="w-12 h-12 rounded-full border-2 border-primary/20"
                            alt="User Profile"
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {guilds.map((guild) => (
                        <Link 
                            to={`/dashboard/${guild.id}`} 
                            key={guild.id}
                            className="glass-card p-6 flex flex-col items-center gap-4 hover:border-primary/50 transition-colors group"
                        >
                            <div className="relative">
                                {guild.icon ? (
                                    <img 
                                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                                        className="w-20 h-20 rounded-3xl shadow-2xl transition-transform group-hover:scale-110"
                                        alt={guild.name}
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-4xl font-bold">
                                        {guild.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h2 className="font-bold text-lg text-center truncate w-full">{guild.name}</h2>
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                                Bot Active
                            </span>
                        </Link>
                    ))}
                    {guilds.length === 0 && (
                        <p className="col-span-full py-20 text-center text-white/20 italic">
                            No guilds found with administrative permissions.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuildSelector;
