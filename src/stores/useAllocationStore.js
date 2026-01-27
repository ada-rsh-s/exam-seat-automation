/**
 * Allocation Store
 * Handles seat allocation state and operations
 */
import { create } from "zustand";
import {
    checkSeatingExists,
    fetchExamDataForAllocation,
    saveAllocationData,
    deleteAllocationForSlot,
} from "../services/allocationService";
import useUIStore from "./useUIStore";

const useAllocationStore = create((set, get) => ({
    // State - Allocation parameters
    classCapacity: {},
    deptStrength: {},
    letStrength: {},
    exams: {},
    drop: [],
    rejoin: {},
    deptStart: {},
    examToday: [],

    // State - Views
    noticeBoardView: [],
    deptView: [],
    classroomView: [],
    attendanceView: [],
    classNames: [],

    // State - Single views for printing
    singleClassView: [],
    singleAttendanceView: [],
    singleClassName: "",

    // State - Current selection
    selectedSlotName: "",
    dateTime: "",

    // State - Loading
    isLoading: false,

    // Actions
    /**
     * Check if seating exists for a slot
     */
    seatingExists: async (slot) => {
        try {
            return await checkSeatingExists(slot);
        } catch (error) {
            console.error("Error checking seating:", error);
            return false;
        }
    },

    /**
     * Fetch exam data for allocation
     */
    fetchExamData: async (examToday, selectedSlotName, prevSlot, slotExists) => {
        const { showAlert } = useUIStore.getState();

        set({
            isLoading: true,
            selectedSlotName: prevSlot,
        });

        try {
            const data = await fetchExamDataForAllocation(examToday, selectedSlotName, slotExists);

            set({
                classCapacity: data.classCapacity,
                deptStrength: data.deptStrength,
                letStrength: data.letStrength,
                exams: data.exams,
                drop: data.drop,
                rejoin: data.rejoin,
                examToday: data.examToday,
                deptStart: data.deptStart,
                selectedSlotName,
                dateTime: data.dateTime,
            });

            if (slotExists) {
                showAlert("loading", `Fetching saved seating for ${selectedSlotName}`);
                return {
                    savedClasses: data.savedClasses,
                    savedData: data.savedData,
                };
            }

            return undefined;
        } catch (error) {
            set({
                isLoading: false,
                selectedSlotName: prevSlot,
            });
            showAlert("warning", error.message);
            return [];
        }
    },

    /**
     * Set allocated data after running the allocation algorithm
     */
    setAllocatedData: async (allocatedData, selectedSlotName) => {
        const { showAlert } = useUIStore.getState();

        if (allocatedData && selectedSlotName) {
            try {
                const result = await saveAllocationData(allocatedData, selectedSlotName);
                set({
                    noticeBoardView: result.noticeBoardView,
                    deptView: result.deptView,
                    classroomView: result.classroomView,
                    attendanceView: result.attendanceView,
                    classNames: result.classNames,
                    isLoading: false,
                });
                return { success: true };
            } catch (error) {
                console.error("Error saving allocation:", error);
                set({ isLoading: false });
                showAlert("warning", "TRY AGAIN!");
                return { success: false, error: error.message };
            }
        } else {
            set({ isLoading: false });
            showAlert("warning", "TRY AGAIN!");
            return { success: false };
        }
    },

    /**
     * Delete allocation for a slot
     */
    deleteAllocatedSlot: async (slot) => {
        const { showAlert } = useUIStore.getState();
        showAlert("warning", `Deleting Seating for Slot ${slot}...`);

        try {
            await deleteAllocationForSlot(slot);

            // Reset allocation state if it was the current slot
            const { selectedSlotName } = get();
            if (selectedSlotName === slot) {
                set({
                    noticeBoardView: [],
                    deptView: [],
                    classroomView: [],
                    attendanceView: [],
                    classNames: [],
                    selectedSlotName: "",
                    dateTime: "",
                });
            }

            return { success: true };
        } catch (error) {
            console.error("Error deleting slot:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Set single class view for printing
     */
    setSingleClassView: (singleClassView, className) => {
        set({
            singleClassView,
            singleClassName: className,
        });
    },

    /**
     * Set single attendance view for printing
     */
    setSingleAttendance: (singleAttendanceView) => {
        set({ singleAttendanceView });
    },

    /**
     * Reset allocation state
     */
    reset: () => {
        set({
            classCapacity: {},
            deptStrength: {},
            letStrength: {},
            exams: {},
            drop: [],
            rejoin: {},
            deptStart: {},
            examToday: [],
            noticeBoardView: [],
            deptView: [],
            classroomView: [],
            attendanceView: [],
            classNames: [],
            singleClassView: [],
            singleAttendanceView: [],
            singleClassName: "",
            selectedSlotName: "",
            dateTime: "",
            isLoading: false,
        });
    },
}));

export default useAllocationStore;
