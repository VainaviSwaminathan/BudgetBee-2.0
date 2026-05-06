import { createContext, useContext, useEffect, useState } from "react";
import {
    getLoggedInUser,
    loginUser,
    signupUser,
    updateUserProfile,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const signup = async (formData) => {
        const data = await signupUser(formData);

        localStorage.setItem("budgetbeeToken", data.token);
        localStorage.setItem("budgetbeeUser", JSON.stringify(data.user));

        setUser(data.user);
        return data;
    };

    const login = async (formData) => {
        const data = await loginUser(formData);

        localStorage.setItem("budgetbeeToken", data.token);
        localStorage.setItem("budgetbeeUser", JSON.stringify(data.user));

        setUser(data.user);
        return data;
    };

    const updateProfile = async (profileData) => {
        const data = await updateUserProfile(profileData);

        localStorage.setItem("budgetbeeUser", JSON.stringify(data.user));
        setUser(data.user);

        return data;
    };

    const logout = () => {
        localStorage.removeItem("budgetbeeToken");
        localStorage.removeItem("budgetbeeUser");
        setUser(null);
    };

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("budgetbeeToken");

            if (!token) {
                setUser(null);
                return;
            }

            const data = await getLoggedInUser();
            setUser(data.user);
        } catch (error) {
            localStorage.removeItem("budgetbeeToken");
            localStorage.removeItem("budgetbeeUser");
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                authLoading,
                signup,
                login,
                updateProfile,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};