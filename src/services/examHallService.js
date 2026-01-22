/**
 * Exam Hall Service
 * Handles exam hall/classroom CRUD operations
 */
import { db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import * as XLSX from "xlsx";

// Document references
const UPLOADED_CLASSES_REF = doc(db, "Classes", "UploadedClasses");
const AVAILABLE_CLASSES_REF = doc(db, "Classes", "AvailableClasses");
const ALLOTTED_CLASSES_REF = doc(db, "Classes", "AllotedClasses");

// Expected headers for exam hall Excel file
const EXPECTED_HEADERS = ["Semester", "Classroom", "No:of desks", "Department"];

// Unwanted sheet names
const UNWANTED_SHEET_NAMES = ["Combined", "Copy of Combined"];

// Special classrooms with different column layouts
const SPECIAL_CLASSROOMS = ["WAB412", "EAB310"];

/**
 * Validate Excel headers
 * @param {Array} headers 
 * @returns {boolean}
 */
const validateHeaders = (headers) =>
    JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);

/**
 * Calculate optimal rows and columns for special classrooms
 * @param {number} desks 
 * @returns {Array} [rows, columns]
 */
const calculateSpecialLayout = (desks) => {
    let columns = 3;

    while (columns < desks) {
        const rows = Math.floor(desks / columns);
        if (rows > columns) {
            columns += 2;
        } else {
            break;
        }
    }

    columns -= 2;
    return [Math.floor(desks / columns), columns];
};

/**
 * Fetch all exam halls with their configurations
 * @returns {Promise<Array>}
 */
export const fetchExamHalls = async () => {
    const [accDocSnap, availDocSnap, allotDocSnap] = await Promise.all([
        getDoc(UPLOADED_CLASSES_REF),
        getDoc(AVAILABLE_CLASSES_REF),
        getDoc(ALLOTTED_CLASSES_REF),
    ]);

    if (!availDocSnap.exists() || !allotDocSnap.exists() || !accDocSnap.exists()) {
        return [];
    }

    const accDocData = accDocSnap.data();
    const availDocData = availDocSnap.data();
    const allotDocData = allotDocSnap.data();

    const sortedData = Object.keys(availDocData)
        .map((key) => {
            const [accrows, acccolumns] = accDocData[key];
            const [rows, columns] = availDocData[key];

            return {
                Hall: key,
                currCapacity: rows * columns,
                accCapacity: accrows * acccolumns,
                rowcol: [rows, columns],
                alloted: Object.prototype.hasOwnProperty.call(allotDocData, key),
            };
        })
        .sort((a, b) => a.Hall.localeCompare(b.Hall));

    return sortedData;
};

/**
 * Update exam hall configurations
 * @param {Array} data 
 */
export const updateExamHalls = async (data) => {
    const updatedData = data.reduce(
        (acc, hall) => {
            acc.available[hall.Hall] = hall.rowcol;
            if (hall.alloted) {
                acc.alloted[hall.Hall] = hall.rowcol;
            }
            return acc;
        },
        { alloted: {}, available: {} }
    );

    await Promise.all([
        setDoc(AVAILABLE_CLASSES_REF, updatedData.available, { merge: true }),
        setDoc(ALLOTTED_CLASSES_REF, updatedData.alloted, { merge: true }),
    ]);
};

/**
 * Allot exam halls for allocation
 * @param {Array} examhalls 
 */
export const allotExamHalls = async (examhalls) => {
    if (examhalls.length === 0) return;

    const updatedData = {};
    for (const hall of examhalls) {
        updatedData[hall.Hall] = hall.rowcol;
    }

    await setDoc(ALLOTTED_CLASSES_REF, updatedData);
};

/**
 * Upload exam halls from Excel workbook
 * @param {object} workbook 
 * @param {function} updateProgress 
 * @param {object} cancelToken 
 */
export const uploadExamHallsFromWorkbook = async (workbook, updateProgress, cancelToken) => {
    if (!workbook) {
        throw new Error("No Workbook Found!");
    }

    const sheetNames = workbook.SheetNames;
    const validSheetNames = sheetNames.filter(
        (name) => !UNWANTED_SHEET_NAMES.some((unwanted) => name.includes(unwanted))
    );

    if (validSheetNames.length === 0) {
        throw new Error("No valid sheets found!");
    }

    // Calculate total items
    let totalItems = 0;
    validSheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        totalItems += data.slice(1).filter((row) => row.length > 0).length;
    });

    let processedItems = 0;
    const classesData = {};
    const classroomSet = new Set();

    for (const sheetName of validSheetNames) {
        if (!cancelToken.current) break;

        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = data[0];

        if (!validateHeaders(headers)) {
            throw new Error(`Invalid headers in sheet ${sheetName}`);
        }

        // Sort by desk count (descending)
        const sortedData = data
            .slice(1)
            .filter((row) => row.length > 0)
            .sort((a, b) => {
                const desksA = parseInt(a[2], 10) || 0;
                const desksB = parseInt(b[2], 10) || 0;
                return desksB - desksA;
            });

        sortedData.forEach((row) => {
            if (!cancelToken.current) return;

            const item = {};
            headers.forEach((header, index) => {
                item[header] = row[index] ? String(row[index]).trim() : "";
            });

            const classroom = item["Classroom"];
            const desks = parseInt(item["No:of desks"], 10);

            // Check for duplicates
            if (classroomSet.has(classroom)) {
                throw new Error(`Duplicate classrooms found: ${classroom}`);
            }
            classroomSet.add(classroom);

            if (classroom && desks) {
                const normalizedClassroom = classroom.replace(/\s/g, "");

                if (SPECIAL_CLASSROOMS.includes(normalizedClassroom)) {
                    classesData[classroom] = calculateSpecialLayout(desks);
                } else {
                    classesData[classroom] = [Math.floor(desks), 2];
                }

                processedItems++;
                const percent = Math.round((processedItems / totalItems) * 100);
                updateProgress(percent);
            }
        });
    }

    // Delete existing and upload new data
    await deleteDoc(AVAILABLE_CLASSES_REF);
    await deleteDoc(ALLOTTED_CLASSES_REF);
    await deleteDoc(UPLOADED_CLASSES_REF);

    await Promise.all([
        setDoc(AVAILABLE_CLASSES_REF, classesData, { merge: true }),
        setDoc(ALLOTTED_CLASSES_REF, classesData, { merge: true }),
        setDoc(UPLOADED_CLASSES_REF, classesData, { merge: true }),
    ]);

    if (!cancelToken.current) {
        throw new Error("Upload Cancelled!");
    }

    updateProgress(100);
};
