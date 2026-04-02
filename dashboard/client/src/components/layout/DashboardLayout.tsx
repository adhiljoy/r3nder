import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DashboardLayout = ({ children, isCore = false }: { children: React.ReactNode, isCore?: boolean }) => {
    const { guildId } = useParams();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={`min-h-screen flex bg-linear-to-b from-background-start to-background-end ${isCore ? "admin-mode" : ""}`}>
            {/* Background Mesh Overlay */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className={`absolute top-0 right-[-10%] w-[800px] h-[800px] blur-[150px] opacity-20 rounded-full ${isCore ? "bg-red-500/20" : "bg-primary/20"}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] blur-[150px] opacity-10 rounded-full ${isCore ? "bg-red-900/30" : "bg-accent/20"}`} />
            </div>

            <Sidebar 
                guildId={guildId} 
                isCore={isCore}
                isOpen={isSidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-500">
                <Navbar 
                    isCore={isCore}
                    onMenuClick={() => setSidebarOpen(true)} 
                />
                
                <div className="flex-1 p-6 lg:p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="max-w-7xl mx-auto"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
