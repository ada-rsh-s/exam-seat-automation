/**
 * Allocation Service
 * Handles seat allocation data operations
 */
import { db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import dayjs from "dayjs";

// Document references
const SAVED_SLOTS_REF = doc(db, "AllExams", "SavedSlots");
const SAVED_DATA_REF = doc(db, "AllExams", "SavedData");
const SAVED_CLASSES_REF = doc(db, "Classes", "savedClasses");
const ALLOTTED_CLASSES_REF = doc(db, "Classes", "AllotedClasses");
const EXAMS_REF = doc(db, "DeptDetails", "Exams");
const LET_REF = doc(db, "DeptDetails", "LetStrength");
const REG_REF = doc(db, "DeptDetails", "RegularStrength");
const DROP_REF = doc(db, "DeptDetails", "Dropped");
const REJOIN_REF = doc(db, "DeptDetails", "Rejoined");
const START_REF = doc(db, "DeptDetails", "StartingRollNo");
const DATETIME_REF = doc(db, "AllExams", "DateTime");

/**
 * Check if seating exists for a slot
 * @param {string} slot 
 * @returns {Promise<boolean>}
 */
export const checkSeatingExists = async (slot) => {
    const [docSnap, dataDocSnap] = await Promise.all([
        getDoc(SAVED_SLOTS_REF),
        getDoc(SAVED_DATA_REF),
    ]);

    if (docSnap.exists() && dataDocSnap.exists()) {
        const savedSlots = docSnap.data();
        const savedData = dataDocSnap.data();

        return (
            Object.prototype.hasOwnProperty.call(savedSlots, slot) &&
            Object.prototype.hasOwnProperty.call(savedData, slot)
        );
    }

    return false;
};

/**
 * Fetch all data needed for seat allocation
 * @param {Array} examToday - List of exams for today
 * @param {string} selectedSlotName 
 * @param {boolean} slotExists - Whether to use saved allocation
 * @returns {Promise<object>}
 */
export const fetchExamDataForAllocation = async (examToday, selectedSlotName, slotExists) => {
    const [
        classSnap,
        examsSnap,
        letSnap,
        regSnap,
        dropSnap,
        rejoinSnap,
        datetimeSnap,
        savedClassSnap,
        startSnap,
    ] = await Promise.all([
        getDoc(ALLOTTED_CLASSES_REF),
        getDoc(EXAMS_REF),
        getDoc(LET_REF),
        getDoc(REG_REF),
        getDoc(DROP_REF),
        getDoc(REJOIN_REF),
        getDoc(DATETIME_REF),
        getDoc(SAVED_CLASSES_REF),
        getDoc(START_REF),
    ]);

    // Check if all required data exists
    const allExist =
        classSnap.exists() &&
        examsSnap.exists() &&
        letSnap.exists() &&
        regSnap.exists() &&
        dropSnap.exists() &&
        rejoinSnap.exists() &&
        datetimeSnap.exists() &&
        startSnap.exists();

    if (!allExist) {
        throw new Error("Insufficient data for allocating the seats!");
    }

    // Get class capacity from saved or allotted
    const classCapacity = slotExists && savedClassSnap.exists()
        ? savedClassSnap.data()[selectedSlotName]
        : classSnap.data();

    const exams = examsSnap.data();
    const letStrength = letSnap.data();
    const deptStrength = regSnap.data();
    const drop = Object.values(dropSnap.data()).flat();
    const rejoin = rejoinSnap.data();
    const deptStart = startSnap.data();
    const datetimeData = datetimeSnap.data();

    // Format datetime
    const dateTime = Object.keys(datetimeData)
        .filter((key) => key.startsWith(selectedSlotName))
        .reduce((formatted, key) => {
            const startDate = dayjs(datetimeData[key][0]).format("DD-MM-YYYY");
            const endDate = dayjs(datetimeData[key][1]).format("DD-MM-YYYY");
            const startTime = dayjs(datetimeData[key][0]).format("hh:mm A");
            const endTime = dayjs(datetimeData[key][1]).format("hh:mm A");
            return `${startDate} - ${endDate} | ${startTime} - ${endTime}`;
        }, "");

    if (dateTime === "") {
        throw new Error("No date-time data found for the selected slot!");
    }

    // Get saved allocation data if exists
    let savedClasses = [];
    let savedData = [];

    if (slotExists) {
        const [savedSlotsSnap, savedDataSnap] = await Promise.all([
            getDoc(SAVED_SLOTS_REF),
            getDoc(SAVED_DATA_REF),
        ]);

        if (savedSlotsSnap.exists() && savedDataSnap.exists()) {
            savedClasses = JSON.parse(savedSlotsSnap.data()[selectedSlotName] || "[]");
            savedData = JSON.parse(savedDataSnap.data()[selectedSlotName] || "[]");
        }
    } else {
        // Save class capacity for new allocation
        const savedClassDocSnap = await getDoc(SAVED_CLASSES_REF);
        if (savedClassDocSnap.exists()) {
            await updateDoc(SAVED_CLASSES_REF, {
                [selectedSlotName]: deleteField(),
            });
        }
        await setDoc(
            SAVED_CLASSES_REF,
            { [selectedSlotName]: classCapacity },
            { merge: true }
        );
    }

    return {
        classCapacity,
        deptStrength,
        letStrength,
        exams,
        drop,
        rejoin,
        examToday,
        deptStart,
        dateTime,
        savedClasses,
        savedData,
    };
};

/**
 * Save allocation data to Firestore
 * @param {Array} allocatedData - [noticeBoardView, deptView, classroomView, attendanceView, classNames, classes, data]
 * @param {string} selectedSlotName 
 */
export const saveAllocationData = async (allocatedData, selectedSlotName) => {
    if (!allocatedData || !selectedSlotName) {
        throw new Error("Invalid allocation data or slot name");
    }

    const stringifiedClasses = JSON.stringify(allocatedData[5]);
    const stringifiedData = JSON.stringify(allocatedData[6]);

    await Promise.all([
        setDoc(
            SAVED_SLOTS_REF,
            { [selectedSlotName]: stringifiedClasses },
            { merge: true }
        ),
        setDoc(
            SAVED_DATA_REF,
            { [selectedSlotName]: stringifiedData },
            { merge: true }
        ),
    ]);

    return {
        noticeBoardView: allocatedData[0],
        deptView: allocatedData[1],
        classroomView: allocatedData[2],
        attendanceView: allocatedData[3],
        classNames: allocatedData[4],
    };
};

/**
 * Delete allocation for a slot
 * @param {string} slot 
 */
export const deleteAllocationForSlot = async (slot) => {
    await Promise.all([
        updateDoc(SAVED_SLOTS_REF, { [slot]: deleteField() }),
        updateDoc(SAVED_DATA_REF, { [slot]: deleteField() }),
        updateDoc(SAVED_CLASSES_REF, { [slot]: deleteField() }),
    ]);
};
