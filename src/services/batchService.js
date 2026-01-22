/**
 * Batch Service
 * Handles all department batch CRUD operations
 */
import { db } from "../utils/firebaseConfig";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    getFirestore,
} from "firebase/firestore";
import dayjs from "dayjs";

const firestore = getFirestore();

// Document references for batch-related data
const DOC_REFS = {
    EXAMS: "Exams",
    EXAMS_COPY: "ExamsCopy",
    REGULAR_STRENGTH: "RegularStrength",
    LET_STRENGTH: "LetStrength",
    DROPPED: "Dropped",
    REJOINED: "Rejoined",
    STARTING_ROLL_NO: "StartingRollNo",
    ACADEMIC_YEAR: "AcademicYear",
};

/**
 * Get document reference for DeptDetails collection
 * @param {string} docName 
 * @returns {DocumentReference}
 */
const getDeptDetailsRef = (docName) => doc(firestore, "DeptDetails", docName);

/**
 * Extract fields from departments array by key
 * @param {Array} depts 
 * @param {string} key 
 * @returns {object}
 */
const getDeptFields = (depts, key) =>
    depts.reduce((acc, dept) => {
        if (dept[key] !== undefined) {
            return { ...acc, [dept.name]: dept[key] };
        }
        return acc;
    }, {});

/**
 * Filter data by academic year suffixes
 * @param {object} data 
 * @param {Array<string>} years 
 * @returns {object}
 */
const filterByYears = (data, years) => {
    return Object.keys(data)
        .filter((key) => years.some((year) => key.startsWith(year)))
        .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});
};

/**
 * Save batch details to Firestore
 * @param {Array} depts - Array of department objects
 * @throws {Error} If save fails
 */
export const saveBatchDetails = async (depts) => {
    const SubFields = getDeptFields(depts, "initialValues");
    const RegFields = getDeptFields(depts, "reg");
    const LetFields = getDeptFields(depts, "let");
    const dropFields = getDeptFields(depts, "drop");
    const rejoinFields = getDeptFields(depts, "rejoin");
    const startFields = getDeptFields(depts, "start");

    const updates = [
        { ref: DOC_REFS.EXAMS, data: SubFields },
        { ref: DOC_REFS.EXAMS_COPY, data: SubFields },
        { ref: DOC_REFS.REGULAR_STRENGTH, data: RegFields },
        { ref: DOC_REFS.LET_STRENGTH, data: LetFields },
        { ref: DOC_REFS.DROPPED, data: dropFields },
        { ref: DOC_REFS.REJOINED, data: rejoinFields },
        { ref: DOC_REFS.STARTING_ROLL_NO, data: startFields },
    ];

    await Promise.all(
        updates
            .filter(({ data }) => Object.keys(data).length > 0)
            .map(({ ref, data }) =>
                setDoc(getDeptDetailsRef(ref), data, { merge: true })
            )
    );
};

/**
 * Fetch all batch details for the given academic year
 * @param {dayjs.Dayjs} academicYear 
 * @returns {Promise<Array>}
 */
export const fetchBatchDetails = async (academicYear) => {
    const years = [
        academicYear.year().toString().slice(-2),
        (academicYear.year() - 1).toString().slice(-2),
        (academicYear.year() - 2).toString().slice(-2),
        (academicYear.year() - 3).toString().slice(-2),
    ];

    const refs = [
        getDeptDetailsRef(DOC_REFS.EXAMS),
        getDeptDetailsRef(DOC_REFS.EXAMS_COPY),
        getDeptDetailsRef(DOC_REFS.REGULAR_STRENGTH),
        getDeptDetailsRef(DOC_REFS.LET_STRENGTH),
        getDeptDetailsRef(DOC_REFS.DROPPED),
        getDeptDetailsRef(DOC_REFS.REJOINED),
        getDeptDetailsRef(DOC_REFS.STARTING_ROLL_NO),
    ];

    const snapshots = await Promise.all(refs.map(getDoc));

    const allExist = snapshots.every((snap) => snap.exists());
    if (!allExist) return [];

    const [examsSnap, examsCopySnap, regSnap, letSnap, dropSnap, rejoinSnap, startSnap] = snapshots;

    const examsData = filterByYears(examsSnap.data(), years);
    const examsCopyData = filterByYears(examsCopySnap.data(), years);
    const regData = filterByYears(regSnap.data(), years);
    const letData = filterByYears(letSnap.data(), years);
    const dropData = filterByYears(dropSnap.data(), years);
    const rejoinData = filterByYears(rejoinSnap.data(), years);
    const startData = filterByYears(startSnap.data(), years);

    // Get all unique department names
    const deptNames = [
        ...new Set([
            ...Object.keys(examsData),
            ...Object.keys(examsCopyData),
            ...Object.keys(regData),
            ...Object.keys(letData),
            ...Object.keys(dropData),
            ...Object.keys(rejoinData),
            ...Object.keys(startData),
        ]),
    ];

    return deptNames.map((deptName) => ({
        deptName,
        letStrength: letData[deptName] || 0,
        regStrength: regData[deptName] || 0,
        exams: examsData[deptName] || [],
        options: examsCopyData[deptName] || [],
        drop: dropData[deptName] || null,
        rejoin: rejoinData[deptName] || null,
        start: startData[deptName] || 0,
    }));
};

/**
 * Update batch details
 * @param {Array} data 
 */
export const updateBatchDetails = async (data) => {
    const examsUpdates = {};
    const regStrengthUpdates = {};
    const letStrengthUpdates = {};
    const dropUpdates = {};
    const rejoinUpdates = {};
    const startUpdates = {};

    data.forEach((item) => {
        examsUpdates[item.deptName] = item.exams || [];
        regStrengthUpdates[item.deptName] = item.regStrength || 0;
        letStrengthUpdates[item.deptName] = item.letStrength || 0;
        dropUpdates[item.deptName] = item.drop || [];
        rejoinUpdates[item.deptName] = item.rejoin || [];
        startUpdates[item.deptName] = item.start || 0;
    });

    await Promise.all([
        setDoc(getDeptDetailsRef(DOC_REFS.EXAMS), examsUpdates, { merge: true }),
        setDoc(getDeptDetailsRef(DOC_REFS.REGULAR_STRENGTH), regStrengthUpdates, { merge: true }),
        setDoc(getDeptDetailsRef(DOC_REFS.LET_STRENGTH), letStrengthUpdates, { merge: true }),
        setDoc(getDeptDetailsRef(DOC_REFS.DROPPED), dropUpdates, { merge: true }),
        setDoc(getDeptDetailsRef(DOC_REFS.REJOINED), rejoinUpdates, { merge: true }),
        setDoc(getDeptDetailsRef(DOC_REFS.STARTING_ROLL_NO), startUpdates, { merge: true }),
    ]);
};

/**
 * Fetch current academic year from database
 * @returns {Promise<dayjs.Dayjs>}
 */
export const fetchAcademicYearFromDB = async () => {
    const docRef = getDeptDetailsRef(DOC_REFS.ACADEMIC_YEAR);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const yearData = docSnap.data();
        const year = yearData.academicYear;

        if (year !== undefined) {
            return dayjs(`${year}-01-01`);
        }
    }

    // If no year exists, create one with current year
    const currentYear = dayjs();
    await setDoc(docRef, { academicYear: currentYear.year() });
    return currentYear;
};

/**
 * Update academic year and migrate department data
 * @param {dayjs.Dayjs} newYear 
 * @returns {Promise<void>}
 */
export const updateAcademicYearInDB = async (newYear) => {
    const docRef = getDeptDetailsRef(DOC_REFS.ACADEMIC_YEAR);
    const examsDocRef = doc(db, "DeptDetails", "Exams");

    const docSnap = await getDoc(examsDocRef);
    if (docSnap.exists() && Object.keys(docSnap.data()).length > 0) {
        const data = docSnap.data();
        const currentYear = newYear.year();
        const yearSuffixes = Object.keys(data).map((key) => key.slice(0, 2));
        const biggestYearSuffix = yearSuffixes.reduce((max, suffix) =>
            suffix > max ? suffix : max
        );

        const updatedData = {};
        for (const key in data) {
            const yearSuffix = key.slice(0, 2);
            const programCode = key.slice(2);
            const yearDifference = parseInt(biggestYearSuffix) - parseInt(yearSuffix);

            const newYearSuffix =
                yearDifference >= 0 && yearDifference <= 3
                    ? (currentYear - yearDifference).toString().slice(-2)
                    : yearSuffix;

            updatedData[newYearSuffix + programCode] = data[key];
        }

        await setDoc(examsDocRef, updatedData, { merge: false });
    }

    await updateDoc(docRef, { academicYear: newYear.year() });

    // Clear related localStorage
    localStorage.removeItem("depts");
    localStorage.removeItem("selectedYear");
};
