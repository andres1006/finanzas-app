'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type User = 'Andrés' | 'Mariana' | null;

interface AuthContextType {
    user: User;
    login: (user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser === 'Andrés' || savedUser === 'Mariana') {
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('currentUser', newUser);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
