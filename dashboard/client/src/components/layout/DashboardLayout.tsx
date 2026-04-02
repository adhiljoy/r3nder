import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { guildId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background text-white font-outfit">
            {/* Sidebar with mobile overlay */}
            <div className={`fixed inset-0 z-50 lg:relative lg:inset-auto ${isSidebarOpen ? "block" : "hidden lg:block"}`}>
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity" 
                    onClick={() => setIsSidebarOpen(false)}
                />
                <Sidebar guildId={guildId!} onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden transition-all duration-500">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="p-4 md:p-8 lg:p-12 min-h-[calc(100vh-80px)]">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
                
                {/* Footer Insight */}
                <footer className="p-8 border-t border-white/5 opacity-20 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    R3NDER OS • Kernel v2.0 • Premium Access Only
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
