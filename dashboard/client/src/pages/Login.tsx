import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
    const { user, loading } = useAuth();

    if (!loading && user) return <Navigate to="/portal" />;

    const handleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
        window.location.href = `${API_URL}/auth/discord`;
    };


    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background px-4">
            <div className="glass-card max-w-md w-full p-10 text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tighter bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                        R3NDER
                    </h1>
                    <p className="text-white/60">
                        The ultimate Discord management experience.
                    </p>
                </div>
                
                <button 
                    onClick={handleLogin}
                    className="premium-btn w-full flex items-center justify-center gap-3"
                >
                    <img src="https://assets-global.website-files.com/6257adef93621795058a865a/6257adef9362174d5c8a8698_discord-white.svg" alt="Discord" className="w-6 h-6" />
                    Login with Discord
                </button>

                <p className="text-xs text-white/20">
                    By logging in, you agree to our Terms of Service.
                </p>
            </div>
        </div>
    );
};

export default Login;
