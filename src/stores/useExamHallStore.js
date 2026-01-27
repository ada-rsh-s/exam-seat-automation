/**
 * Exam Hall Store
 * Handles exam hall/classroom state and operations
 */
import { create } from "zustand";
import {
    fetchExamHalls as fetchExamHallsFromDB,
    updateExamHalls as updateExamHallsInDB,
    allotExamHalls as allotExamHallsInDB,
    uploadExamHallsFromWorkbook,
} from "../services/examHallService";
import useUIStore from "./useUIStore";

const useExamHallStore = create((set) => ({
    // State
    examHalls: [],
    isLoading: false,
    uploadProgress: 0,

    // Actions
    /**
     * Fetch all exam halls
     */
    fetchExamHalls: async () => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Fetching Exam Halls...");
        set({ isLoading: true });

        try {
            const examHalls = await fetchExamHallsFromDB();
            set({ examHalls, isLoading: false });
            return examHalls;
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return [];
        }
    },

    /**
     * Update exam hall configurations
     */
    updateExamHalls: async (data) => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Updating Capacity...");
        set({ isLoading: true });

        try {
            await updateExamHallsInDB(data);
            set({ examHalls: data, isLoading: false });
            showAlert("success", "Capacity Updated Successfully!");
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Allot exam halls for allocation
     */
    allotExamHalls: async (examhalls) => {
        try {
            await allotExamHallsInDB(examhalls);
            return { success: true };
        } catch (error) {
            console.error("Error allotting exam halls:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Upload exam halls from Excel workbook
     */
    uploadExamHallsFile: async (workbook, cancelToken) => {
        const { showAlert } = useUIStore.getState();

        const updateProgress = (progress) => {
            set({ uploadProgress: progress });
        };

        set({ isLoading: true, uploadProgress: 0 });

        try {
            await uploadExamHallsFromWorkbook(workbook, updateProgress, cancelToken);

            if (cancelToken.current) {
                showAlert("success", "Classroom and desk data updated!");
                set({ isLoading: false, uploadProgress: 100 });
                return { success: true };
            } else {
                set({ isLoading: false, uploadProgress: 0 });
                return { success: false, cancelled: true };
            }
        } catch (error) {
            set({ isLoading: false, uploadProgress: 0 });
            showAlert("error", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Reset upload progress
     */
    resetUploadProgress: () => {
        set({ uploadProgress: 0 });
    },

    /**
     * Reset exam hall state
     */
    reset: () => {
        set({
            examHalls: [],
            isLoading: false,
            uploadProgress: 0,
        });
    },
}));

export default useExamHallStore;
