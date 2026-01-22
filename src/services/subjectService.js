/**
 * Subject Service
 * Handles subject CRUD and Excel file upload operations
 */
import { db } from "../utils/firebaseConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    writeBatch,
} from "firebase/firestore";
import * as XLSX from "xlsx";

// Expected headers for subject Excel file
const EXPECTED_HEADERS = [
    "DEPT",
    "SEM",
    "SLOT",
    "COURSE CODE",
    "COURSE NAME",
    "L",
    "T",
    "P",
    "HOURS",
    "CREDIT",
];

// Sheets to skip during upload
const UNWANTED_SHEET_NAMES = ["Combined", "Copy of Combined", "LAB"];

/**
 * Validate Excel headers
 * @param {Array} headers 
 * @returns {boolean}
 */
const validateHeaders = (headers) => {
    return JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
};

/**
 * Fetch all subjects from Firestore
 * @returns {Promise<Array>}
 */
export const fetchSubjects = async () => {
    const subjectsCollection = collection(db, "Subjects");
    const querySnapshot = await getDocs(subjectsCollection);

    const subjects = [];
    querySnapshot.forEach((doc) => {
        subjects.push(doc.data());
    });

    return subjects;
};

/**
 * Delete all academic data (used before fresh upload)
 * @returns {Promise<void>}
 */
export const deleteAllAcademicData = async () => {
    const collectionsToDelete = [
        "Subjects",
        "AllExams",
        "DeptDetails",
        "Classes",
        "users",
    ];

    const batch = writeBatch(db);

    for (const collectionName of collectionsToDelete) {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
    }

    await batch.commit();
};

/**
 * Upload subjects from Excel workbook
 * @param {object} workbook - XLSX workbook object
 * @param {function} updateProgress - Callback for progress updates
 * @param {object} cancelToken - {current: boolean} for cancellation
 * @returns {Promise<void>}
 */
export const uploadSubjectsFromWorkbook = async (workbook, updateProgress, cancelToken) => {
    if (!workbook) {
        throw new Error("No Workbook Found!");
    }

    const subjectsCollection = collection(db, "Subjects");
    const slotsDocRef = doc(db, "AllExams", "Slots");
    const editedSlotsDocRef = doc(db, "AllExams", "EditedSlots");

    const sheetNames = workbook.SheetNames;
    const validSheetNames = sheetNames.filter(
        (name) => !UNWANTED_SHEET_NAMES.some((unwanted) => name.includes(unwanted))
    );

    // Calculate total items
    let totalItems = 0;
    validSheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        totalItems += data.slice(1).filter((row) => row.length > 0).length;
    });

    let processedItems = 0;
    const slotsData = {};

    for (const sheetName of validSheetNames) {
        if (cancelToken.current === false) break;

        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = data[0];

        if (!validateHeaders(headers)) {
            throw new Error(`Invalid headers in sheet ${sheetName}`);
        }

        for (const row of data.slice(1)) {
            if (row.length === 0) continue;
            if (cancelToken.current === false) break;

            // Map row to object
            const item = {};
            headers.forEach((header, index) => {
                item[header] =
                    row[index] !== undefined && row[index] !== null
                        ? String(row[index]).trim()
                        : row[index];
            });
            item["COURSE CODE"] = item["COURSE CODE"].replace(/\s+/g, "");

            // Extract slot information
            const slot = item["SLOT"];
            const courseCode = item["COURSE CODE"];

            if (slot && courseCode) {
                const slots = slot.split(",").map((s) => s.trim().charAt(0));
                slots.forEach((slotChar) => {
                    if (!slotsData[slotChar]) {
                        slotsData[slotChar] = [];
                    }
                    if (!slotsData[slotChar].includes(courseCode)) {
                        slotsData[slotChar].push(courseCode);
                    }
                });
            }

            // Upload individual subject
            const courseCodeDept = `${item["SEM"]}_${item["DEPT"]}_${item["COURSE CODE"]}`;
            await setDoc(doc(subjectsCollection, courseCodeDept), item);

            processedItems += 1;
            const percent = Math.round((processedItems / totalItems) * 100);
            updateProgress(percent);
        }
    }

    // Upload accumulated slots data
    await setDoc(slotsDocRef, slotsData, { merge: true });
    await setDoc(editedSlotsDocRef, slotsData, { merge: true });

    if (cancelToken.current === false) {
        throw new Error("Upload Cancelled!");
    }

    updateProgress(100);
};

/**
 * Fetch exam options for a specific year group
 * @param {string} selectedYear - e.g., "first_years", "second_years"
 * @returns {Promise<Array>}
 */
export const fetchExamOptions = async (selectedYear) => {
    const academicYearSnap = await getDoc(doc(db, "DeptDetails", "AcademicYear"));

    const yearMap = {
        first_years: ["S1", "S2"],
        second_years: ["S3", "S4"],
        third_years: ["S5", "S6"],
        fourth_years: ["S7", "S8"],
    };

    const fetchArray = yearMap[selectedYear] || [];
    const subjectSnap = await getDocs(
        query(collection(db, "Subjects"), where("SEM", "in", fetchArray))
    );

    const academicYear = academicYearSnap
        .data()
        .academicYear.toString()
        .substring(2, 4);

    const deptDetails = {};

    // Initialize and populate deptDetails
    subjectSnap.forEach((doc) => {
        const { SEM: sem, DEPT: dept, "COURSE CODE": courseCode } = doc.data();
        const yearOffset = Math.floor((parseInt(sem[1]) - 1) / 2);
        const key = `${academicYear - yearOffset}${dept.substring(0, 2)}`;

        if (!deptDetails[key]) {
            deptDetails[key] = [];
        }
        if (!deptDetails[key].includes(courseCode)) {
            deptDetails[key].push(courseCode);
        }
    });

    return Object.keys(deptDetails).map((key) => ({
        name: key,
        options: deptDetails[key],
        initialValues: deptDetails[key],
        reg: 0,
        let: 0,
        drop: [],
        rejoin: [],
    }));
};
