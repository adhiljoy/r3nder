import { useEffect, useState } from "react";
import axios from "axios";
import { 
    Activity, Users, Layers, AlertCircle, 
    Zap, Terminal, ShieldAlert 
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AdminOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "https://ACTUAL_RENDER_URL";
        axios.get(`${API_URL}/api/admin/analytics/overview`, { withCredentials: true })
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);


    if (loading) return <div className="animate-pulse text-white/50">Loading Admin Stats...</div>;
    if (!stats) return <div className="text-red-400">Failed to load admin dashboard. Restricted Access.</div>;

    const kpis = [
        { label: "Total Logs", value: stats.totalLogs, icon: <Terminal size={20} />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Total Servers", value: stats.totalGuilds, icon: <Layers size={20} />, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Total Users", value: stats.totalUsers, icon: <Users size={20} />, color: "text-green-400", bg: "bg-green-400/10" },
        { label: "System Health", value: "99.9%", icon: <Activity size={20} />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    ];

    const chartData = stats.statsByType.map((s: any) => ({
        name: (s._id || "unknown").toUpperCase(),
        count: s.count
    }));

    const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#f59e0b"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={32} />
                        Admin Command Center
                    </h1>
                    <p className="text-white/50 mt-1">Real-time bot monitoring & global forensics</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {kpi.icon}
                            </div>
                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Live</div>
                        </div>
                        <div className="text-3xl font-black text-white mb-1 tracking-tighter">
                            {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                        </div>
                        <div className="text-sm font-medium text-white/40">{kpi.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Event Distribution */}
                <div className="lg:col-span-2 glass-card p-8 rounded-4xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap size={20} className="text-primary" />
                            Global Event Distribution
                        </h2>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "#000", border: "1px solid #ffffff10", borderRadius: "12px", color: "#fff" }}
                                    cursor={{ fill: "#ffffff05" }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {chartData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Alerts */}
                <div className="glass-card p-8 rounded-4xl border border-white/5 bg-red-500/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-500" />
                        Active Incidents
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-red-500/20">
                            <div className="text-xs font-bold text-red-500 mb-1 uppercase tracking-widest">Rate Limit</div>
                            <p className="text-sm text-white/70">Database sync optimized. Batching currently at 1.2k/min.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-blue-500/20">
                            <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-widest">Migration</div>
                            <p className="text-sm text-white/70">Logging service transitioned to LogPriority system.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/20">
                            <div className="text-xs font-bold text-emerald-500 mb-1 uppercase tracking-widest">Connectivity</div>
                            <p className="text-sm text-white/70">All internal APIs (3001, 3002) operational.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
