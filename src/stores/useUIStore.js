/**
 * UI Store
 * Handles global UI state like loading and notifications
 */
import { create } from "zustand";

const useUIStore = create((set, get) => ({
    // State
    isLoading: false,
    alertQueue: [],

    // Actions
    setLoading: (isLoading) => set({ isLoading }),

    /**
     * Show alert notification
     * This will be consumed by a component that renders Ant Design messages
     * @param {string} type - 'success' | 'error' | 'warning' | 'loading'
     * @param {string} content - Message content
     */
    showAlert: (type, content) => {
        const alert = { type, content, timestamp: Date.now() };
        set((state) => ({
            alertQueue: [...state.alertQueue, alert],
        }));
    },

    /**
     * Clear an alert from the queue
     */
    clearAlert: () => {
        set((state) => ({
            alertQueue: state.alertQueue.slice(1),
        }));
    },

    /**
     * Get the next alert to display
     */
    getNextAlert: () => {
        const { alertQueue } = get();
        return alertQueue[0] || null;
    },
}));

export default useUIStore;
