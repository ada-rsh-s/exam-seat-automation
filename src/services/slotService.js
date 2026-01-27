/**
 * Slot Service
 * Handles all exam slot CRUD operations
 */
import { db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import dayjs from "dayjs";

// Document references
const SLOTS_REF = doc(db, "AllExams", "Slots");
const EDITED_SLOTS_REF = doc(db, "AllExams", "EditedSlots");
const DATETIME_REF = doc(db, "AllExams", "DateTime");

/**
 * Fetch all slots with their exam assignments and datetime
 * @returns {Promise<Array>}
 */
export const fetchSlots = async () => {
    const [editedslotsSnap, slotsSnap, datetimeSnap] = await Promise.all([
        getDoc(EDITED_SLOTS_REF),
        getDoc(SLOTS_REF),
        getDoc(DATETIME_REF),
    ]);

    if (!slotsSnap.exists()) return [];

    const slotsData = slotsSnap.data();
    const editedSlotsData = editedslotsSnap.data() || {};
    const datetimeData = datetimeSnap.data() || {};

    const formattedData = Object.keys(editedSlotsData).map((slotKey) => {
        const exams = editedSlotsData[slotKey] || [];
        const date = datetimeData[slotKey];

        return {
            Slot: slotKey,
            Exams: exams,
            Date: Array.isArray(date) ? date.map(dayjs) : null,
            options: slotsData[slotKey] || [],
        };
    });

    return formattedData.sort((a, b) => a.Slot.localeCompare(b.Slot));
};

/**
 * Update slot configurations
 * @param {Array} data - Array of slot objects
 */
export const updateSlots = async (data) => {
    const slotsUpdates = {};
    const datetimeUpdates = {};

    data.forEach((item) => {
        // Update exams
        if (item.Exams) {
            slotsUpdates[item.Slot] = item.Exams;
        }

        // Update datetime
        if (item.Date && Array.isArray(item.Date)) {
            datetimeUpdates[item.Slot] = item.Date.map((date) => date.toISOString());
        }
    });

    const updates = [];

    if (Object.keys(slotsUpdates).length > 0) {
        updates.push(setDoc(EDITED_SLOTS_REF, slotsUpdates, { merge: true }));
    }

    if (Object.keys(datetimeUpdates).length > 0) {
        updates.push(setDoc(DATETIME_REF, datetimeUpdates, { merge: true }));
    }

    await Promise.all(updates);
};

/**
 * Fetch only slot names (for dropdown)
 * @returns {Promise<{slotNames: Array, slots: object}>}
 */
export const fetchSlotNames = async () => {
    const docSnap = await getDoc(EDITED_SLOTS_REF);

    if (!docSnap.exists()) {
        return { slotNames: [], slots: {} };
    }

    const docData = docSnap.data();
    const sortedKeys = Object.keys(docData).sort();

    return { slotNames: sortedKeys, slots: docData };
};
