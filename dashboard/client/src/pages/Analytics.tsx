import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import { TrendingUp, Users, MessageSquare, BarChart3 } from "lucide-react";

const Analytics = () => {
    const { guildId } = useParams();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "https://YOUR_RENDER_BACKEND_URL";
        axios.get(`${API_URL}/api/guild/${guildId}/analytics`, { withCredentials: true })
            .then(res => {
                const formatted = res.data.map((d: any) => ({
                    ...d,

                    name: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                    fullDate: new Date(d.date).toLocaleDateString()
                }));
                setData(formatted);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [guildId]);

    if (loading) return <div className="p-20 text-center text-white/40">Analyzing community data...</div>;

    // Aggregate totals
    const totalMessages = data.reduce((sum, d) => sum + (d.messages || 0), 0);
    const avgActiveUsers = data.length ? Math.round(data.reduce((sum, d) => sum + (d.activeUsers || 0), 0) / data.length) : 0;

    // Get all unique commands and their total counts
    const commandMap = new Map();
    data.forEach(day => {
        day.commands?.forEach((cmd: any) => {
            commandMap.set(cmd.name, (commandMap.get(cmd.name) || 0) + cmd.count);
        });
    });

    const topCommands = Array.from(commandMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const COLORS = ['#5865F2', '#C392FF', '#7289da', '#43b581', '#faa61a'];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight">Analytics</h2>
                <p className="text-white/40 text-lg">Detailed growth and engagement metrics for your server.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-white/40 font-medium">Total Messages (7d)</p>
                        <h4 className="text-3xl font-black">{totalMessages.toLocaleString()}</h4>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-white/40 font-medium">Avg. Active Users</p>
                        <h4 className="text-3xl font-black">{avgActiveUsers.toLocaleString()}</h4>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-white/40 font-medium">Growth Index</p>
                        <h4 className="text-3xl font-black">Stable</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Waveform */}
                <div className="lg:col-span-2 glass-card p-8 flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="text-primary" />
                            <h3 className="text-xl font-bold">Activity Trends</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#ffffff40', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    hide 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#121214', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#5865F2' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="messages" 
                                    stroke="#5865F2" 
                                    strokeWidth={4} 
                                    dot={{ fill: '#5865F2', r: 4 }} 
                                    activeDot={{ r: 8, stroke: '#5865F220', strokeWidth: 10 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="activeUsers" 
                                    stroke="#C392FF" 
                                    strokeWidth={4} 
                                    dot={{ fill: '#C392FF', r: 4 }} 
                                    activeDot={{ r: 8, stroke: '#C392FF20', strokeWidth: 10 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Commands */}
                <div className="glass-card p-8 flex flex-col gap-8">
                    <h3 className="text-xl font-bold">Popular Modules</h3>
                    <div className="flex-1 space-y-6">
                        {topCommands.length > 0 ? (
                            topCommands.map((cmd, i) => (
                                <div key={cmd.name} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-white/60">/{cmd.name}</span>
                                        <span className="text-white/40">{cmd.count} uses</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000" 
                                            style={{ 
                                                width: `${(cmd.count / topCommands[0].count) * 100}%`,
                                                backgroundColor: COLORS[i % COLORS.length]
                                            }} 
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/20 text-sm italic">
                                No command data yet...
                            </div>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/40 uppercase tracking-widest text-center">
                        Last updated 1 minute ago
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
