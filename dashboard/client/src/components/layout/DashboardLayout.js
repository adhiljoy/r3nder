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
const Sidebar_1 = __importDefault(require("./Sidebar"));
const Navbar_1 = __importDefault(require("./Navbar"));
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const DashboardLayout = ({ children, isCore = false }) => {
    const { guildId } = (0, react_router_dom_1.useParams)();
    const location = (0, react_router_dom_1.useLocation)();
    const [isSidebarOpen, setSidebarOpen] = (0, react_1.useState)(false);
    return (<div className={`min-h-screen flex bg-linear-to-b from-background-start to-background-end ${isCore ? "admin-mode" : ""}`}>
            {/* Background Mesh Overlay */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className={`absolute top-0 right-[-10%] w-[800px] h-[800px] blur-[150px] opacity-20 rounded-full ${isCore ? "bg-red-500/20" : "bg-primary/20"}`}/>
                <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] blur-[150px] opacity-10 rounded-full ${isCore ? "bg-red-900/30" : "bg-accent/20"}`}/>
            </div>

            <Sidebar_1.default guildId={guildId} isCore={isCore} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}/>

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-500">
                <Navbar_1.default isCore={isCore} onMenuClick={() => setSidebarOpen(true)}/>
                
                <div className="flex-1 p-6 lg:p-12">
                    <framer_motion_1.AnimatePresence mode="wait">
                        <framer_motion_1.motion.div key={location.pathname} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: "circOut" }} className="max-w-7xl mx-auto">
                            {children}
                        </framer_motion_1.motion.div>
                    </framer_motion_1.AnimatePresence>
                </div>
            </main>
        </div>);
};
exports.default = DashboardLayout;
