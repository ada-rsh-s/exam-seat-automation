/**
 * Batch Store
 * Handles batch/department state and academic year management
 */
import { create } from "zustand";
import dayjs from "dayjs";
import {
    saveBatchDetails,
    fetchBatchDetails,
    updateBatchDetails,
    fetchAcademicYearFromDB,
    updateAcademicYearInDB,
} from "../services/batchService";
import { fetchExamOptions as fetchExamOptionsFromDB } from "../services/subjectService";
import useUIStore from "./useUIStore";

const useBatchStore = create((set, get) => ({
    // State
    academicYear: null,
    batches: [],
    isLoading: false,

    // Actions
    /**
     * Fetch academic year from database
     */
    fetchAcademicYear: async () => {
        try {
            const academicYear = await fetchAcademicYearFromDB();
            set({ academicYear });
            return academicYear;
        } catch (error) {
            console.error("Error fetching academic year:", error);
            return null;
        }
    },

    /**
     * Update academic year (with data migration)
     */
    updateAcademicYear: async (newYear) => {
        const { showAlert } = useUIStore.getState();
        const { academicYear: prevYear } = get();

        showAlert("loading", `Updating year to ${newYear.year()}`);
        set({ isLoading: true });

        try {
            await updateAcademicYearInDB(newYear);
            set({ academicYear: newYear, isLoading: false });
            showAlert("success", `Academic year changed to ${newYear.year()}`);
            return { success: true };
        } catch (error) {
            set({ academicYear: prevYear, isLoading: false });
            showAlert("error", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Fetch batches for the current academic year
     */
    fetchBatches: async (academicYear) => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Fetching Batches...");
        set({ isLoading: true });

        try {
            const yearToUse = academicYear || get().academicYear;
            const batches = await fetchBatchDetails(yearToUse);
            set({ batches, isLoading: false });
            return batches;
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return [];
        }
    },

    /**
     * Save batch details (from form)
     */
    saveBatches: async (depts) => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Updating Batch Details...");
        set({ isLoading: true });

        try {
            await saveBatchDetails(depts);
            set({ isLoading: false });
            showAlert("success", "Batch Details Updated Successfully!");
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update batch details
     */
    updateBatches: async (data) => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Updating Batches...");
        set({ isLoading: true });

        try {
            await updateBatchDetails(data);
            set({ batches: data, isLoading: false });
            showAlert("success", "Batches Updated Successfully!");
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Fetch exam options for a specific year group
     */
    fetchExamOptions: async (selectedYear) => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Fetching Options...");

        try {
            const options = await fetchExamOptionsFromDB(selectedYear);
            return options;
        } catch (error) {
            showAlert("error", error.message);
            throw error;
        }
    },

    /**
     * Reset batch state
     */
    reset: () => {
        set({
            academicYear: null,
            batches: [],
            isLoading: false,
        });
    },
}));

export default useBatchStore;
