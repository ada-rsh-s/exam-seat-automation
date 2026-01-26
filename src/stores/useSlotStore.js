/**
 * Slot Store
 * Handles exam slot state and actions
 */
import { create } from "zustand";
import {
    fetchSlots as fetchSlotsFromDB,
    updateSlots as updateSlotsInDB,
    fetchSlotNames as fetchSlotNamesFromDB,
} from "../services/slotService";
import useUIStore from "./useUIStore";

const useSlotStore = create((set, get) => ({
    // State
    slots: {},
    slotNames: [],
    slotsData: [],
    isLoading: false,

    // Actions
    /**
     * Fetch all slots with their configurations
     */
    fetchSlots: async () => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Fetching Slots...");
        set({ isLoading: true });

        try {
            const slotsData = await fetchSlotsFromDB();
            set({ slotsData, isLoading: false });
            return slotsData;
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return [];
        }
    },

    /**
     * Update slot configurations
     */
    updateSlots: async (data) => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Updating Slots...");
        set({ isLoading: true });

        try {
            await updateSlotsInDB(data);
            set({ slotsData: data, isLoading: false });
            showAlert("success", "Slots Updated Successfully!");
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Fetch slot names for dropdown
     */
    fetchSlotNames: async () => {
        try {
            const { slotNames, slots } = await fetchSlotNamesFromDB();
            set({ slotNames, slots });
            return slotNames;
        } catch (error) {
            const { showAlert } = useUIStore.getState();
            showAlert("error", error.message);
            return [];
        }
    },

    /**
     * Get exams for a specific slot
     */
    getExamsForSlot: (slotName) => {
        const { slots } = get();
        return slots[slotName] || [];
    },

    /**
     * Reset slot state
     */
    reset: () => {
        set({
            slots: {},
            slotNames: [],
            slotsData: [],
            isLoading: false,
        });
    },
}));

export default useSlotStore;
