/**
 * Subject Store
 * Handles subject state and file upload operations
 */
import { create } from "zustand";
import {
    fetchSubjects as fetchSubjectsFromDB,
    uploadSubjectsFromWorkbook,
    deleteAllAcademicData,
} from "../services/subjectService";
import useUIStore from "./useUIStore";

const useSubjectStore = create((set) => ({
    // State
    subjects: [],
    isLoading: false,
    uploadProgress: 0,

    // Actions
    /**
     * Fetch all subjects
     */
    fetchSubjects: async () => {
        const { showAlert } = useUIStore.getState();
        showAlert("loading", "Fetching Subjects...");
        set({ isLoading: true });

        try {
            const subjects = await fetchSubjectsFromDB();
            set({ subjects, isLoading: false });
            return subjects;
        } catch (error) {
            set({ isLoading: false });
            showAlert("error", error.message);
            return [];
        }
    },

    /**
     * Upload subjects from Excel workbook
     */
    uploadSubjectsFile: async (workbook, cancelToken) => {
        const { showAlert } = useUIStore.getState();

        const updateProgress = (progress) => {
            set({ uploadProgress: progress });
        };

        showAlert("loading", "Deleting current academic data...");
        set({ isLoading: true, uploadProgress: 0 });

        try {
            await deleteAllAcademicData();
            showAlert("warning", "All academic data deleted!");
            showAlert("loading", "Uploading new file...");

            await uploadSubjectsFromWorkbook(workbook, updateProgress, cancelToken);

            if (cancelToken.current !== false) {
                showAlert("success", "Subjects and slots updated!");
                set({ isLoading: false, uploadProgress: 100 });
                return { success: true };
            } else {
                showAlert("warning", "Upload Cancelled!");
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
     * Reset subject state
     */
    reset: () => {
        set({
            subjects: [],
            isLoading: false,
            uploadProgress: 0,
        });
    },
}));

export default useSubjectStore;
