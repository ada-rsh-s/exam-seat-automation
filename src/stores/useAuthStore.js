/**
 * Auth Store
 * Handles authentication state and actions
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    loginUser,
    registerUser,
    saveUserToStorage,
    removeUserFromStorage,
    getUserFromStorage,
} from "../services/authService";
import useUIStore from "./useUIStore";

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: getUserFromStorage(),
            isLoading: false,

            // Actions
            /**
             * Login user with email and password
             */
            login: async (email, password) => {
                const { showAlert } = useUIStore.getState();
                showAlert("loading", "Authenticating...");
                set({ isLoading: true });

                try {
                    const user = await loginUser(email, password);
                    set({ user, isLoading: false });
                    saveUserToStorage(user);
                    showAlert("success", "Login Successful!");
                    return { success: true, user };
                } catch (error) {
                    set({ isLoading: false });
                    const errormsg = error.message.split("/")[1] || error.message;
                    showAlert("error", errormsg);
                    return { success: false, error: errormsg };
                }
            },

            /**
             * Register new user
             */
            register: async (username, email, password) => {
                const { showAlert } = useUIStore.getState();
                showAlert("loading", "Creating account...");
                set({ isLoading: true });

                try {
                    const user = await registerUser(username, email, password);
                    set({ user, isLoading: false });
                    saveUserToStorage(user);
                    showAlert("success", "Registration Successful!");
                    return { success: true, user };
                } catch (error) {
                    set({ isLoading: false });
                    const errormsg = error.message.split("/")[1] || error.message;
                    showAlert("error", errormsg);
                    return { success: false, error: errormsg };
                }
            },

            /**
             * Logout user
             */
            logout: () => {
                removeUserFromStorage();
                set({ user: null });
            },

            /**
             * Check if user is authenticated
             */
            isAuthenticated: () => {
                const { user } = get();
                return user !== null;
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user }),
        }
    )
);

export default useAuthStore;
