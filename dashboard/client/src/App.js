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
const react_router_dom_1 = require("react-router-dom");
const Landing_1 = __importDefault(require("./pages/Landing"));
const Login_1 = __importDefault(require("./pages/Login"));
const AuthContext_1 = require("./context/AuthContext");
const DashboardLayout_1 = __importDefault(require("./components/layout/DashboardLayout"));
const PageLoader = () => (<div className="h-screen w-screen flex flex-col items-center justify-center bg-background-start text-white gap-6">
        <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin shadow-2xl shadow-primary/20"/>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse text-center">Syncing Nexus Pulse...</p>
    </div>);
const ProtectedRoute = ({ children }) => {
    const { user, loading } = (0, AuthContext_1.useAuth)();
    if (loading)
        return <PageLoader />;
    if (!user)
        return <react_router_dom_1.Navigate to="/login"/>;
    return children;
};
const AdminRoute = ({ children }) => {
    const { user, loading } = (0, AuthContext_1.useAuth)();
    if (loading)
        return <PageLoader />;
    if (!user || !user.isAdmin)
        return <react_router_dom_1.Navigate to="/app"/>;
    return children;
};
// High-Fidelity SaaS Pages
const GuildSelector = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/GuildSelector"))));
const Dashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/Dashboard"))));
const AdminOverview = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/AdminOverview"))));
const AdminLogs = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/AdminLogs"))));
const UserProfile = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/UserProfile"))));
const App = () => {
    return (<AuthContext_1.AuthProvider>
            <react_router_dom_1.BrowserRouter>
                <react_router_dom_1.Routes>
                    {/* Public SaaS Entry */}
                    <react_router_dom_1.Route path="/" element={<Landing_1.default />}/>
                    <react_router_dom_1.Route path="/login" element={<Login_1.default />}/>
                    
                    {/* User Nexus Hub */}
                    <react_router_dom_1.Route path="/app" element={<ProtectedRoute>
                            <react_1.Suspense fallback={<PageLoader />}>
                                <GuildSelector />
                            </react_1.Suspense>
                        </ProtectedRoute>}/>

                    {/* Server Command Suite */}
                    <react_router_dom_1.Route path="/app/:guildId/*" element={<ProtectedRoute>
                            <DashboardLayout_1.default>
                                <react_1.Suspense fallback={<PageLoader />}>
                                    <react_router_dom_1.Routes>
                                        <react_router_dom_1.Route index element={<Dashboard />}/>
                                        <react_router_dom_1.Route path=":tab" element={<Dashboard />}/>
                                        <react_router_dom_1.Route path="profile" element={<UserProfile />}/>
                                        <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="" replace/>}/>
                                    </react_router_dom_1.Routes>

                                </react_1.Suspense>
                            </DashboardLayout_1.default>
                        </ProtectedRoute>}/>

                    {/* Global Admin Core */}
                    <react_router_dom_1.Route path="/core/*" element={<AdminRoute>
                            <DashboardLayout_1.default isCore>
                                <react_1.Suspense fallback={<PageLoader />}>
                                    <react_router_dom_1.Routes>
                                        <react_router_dom_1.Route path="overview" element={<AdminOverview />}/>
                                        <react_router_dom_1.Route path="analytics" element={<AdminOverview />}/>
                                        <react_router_dom_1.Route path="status" element={<AdminOverview />}/>
                                        <react_router_dom_1.Route path="logs" element={<AdminLogs />}/>
                                        <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="overview" replace/>}/>
                                    </react_router_dom_1.Routes>

                                </react_1.Suspense>
                            </DashboardLayout_1.default>
                        </AdminRoute>}/>

                    {/* Final Catch-All */}
                    <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="/" replace/>}/>
                </react_router_dom_1.Routes>
            </react_router_dom_1.BrowserRouter>
        </AuthContext_1.AuthProvider>);
};
exports.default = App;
