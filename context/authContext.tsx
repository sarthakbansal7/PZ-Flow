"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { authApi } from '@/api';
import { LoginFormData, RegisterFormData } from '@/lib/interfaces';

// User interface
interface User {
    email: string,
    isAdmin: boolean,
    company: string,
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean | undefined;
    logout: () => void;
    login: (credentials: LoginFormData) => Promise<{ success: boolean; error?: string }>;
    register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    // Login function
    const login = async (credentials: LoginFormData): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            const response = await authApi.login(credentials);

            if (response?.token && response?.safeUser) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.safeUser));
                setUser(response.safeUser);
                toast.success(`Welcome back, ${response.safeUser.email}!`);
                return { success: true };
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Failed to login. Please try again.";
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            await authApi.register(data);
            toast.success("Account created successfully!");
            return await login({ email: data.email, password: data.password });
        } catch (error: any) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.message || "Failed to register. Please try again.";
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('authToken');
            const userJson = localStorage.getItem('user');

            if (token && userJson) {
                try {
                    const userData = JSON.parse(userJson) as User;
                    setUser(userData);
                } catch (e) {
                    // Invalid user data, clear storage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                isAdmin: user?.isAdmin,
                logout,
                login,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

