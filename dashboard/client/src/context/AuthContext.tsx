import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface AuthContextType {
    user: any;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
        axios.get(`${API_URL}/api/user`, { withCredentials: true })
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        const API_URL = import.meta.env.VITE_API_URL || "https://r3nder-api.onrender.com";
        axios.get(`${API_URL}/api/auth/logout`, { withCredentials: true })
            .then(() => setUser(null));
    };


    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
