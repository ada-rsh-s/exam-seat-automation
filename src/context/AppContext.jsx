/**
 * App Context
 * Centralized state management
 */
import React, { useReducer, useContext, createContext } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import reducer from "./reducers";
import {
  LOGOUT_USER,
  SET_ACADEMIC_YEAR,
  SET_ALLOCATED_DATA,
  SET_ALLOCATION_DETAILS,
  SET_SINGLE_ATTENDANCE,
  SET_SINGLE_CLASS,
  SET_SLOT_LOADING,
  SET_SLOTS,
  SETUP_USER_BEGIN,
  SETUP_USER_ERROR,
  SETUP_USER_SUCCESS,
} from "./actions";

import {
  loginUser,
  registerUser,
  saveUserToStorage,
  removeUserFromStorage,
  getUserFromStorage,
} from "../services/authService";

import {
  saveBatchDetails,
  fetchBatchDetails,
  updateBatchDetails,
  fetchAcademicYearFromDB,
  updateAcademicYearInDB,
} from "../services/batchService";

import {
  fetchSlots as fetchSlotsFromDB,
  updateSlots as updateSlotsInDB,
  fetchSlotNames as fetchSlotNamesFromDB,
} from "../services/slotService";

import {
  fetchSubjects as fetchSubjectsFromDB,
  uploadSubjectsFromWorkbook,
  deleteAllAcademicData,
  fetchExamOptions as fetchExamOptionsFromDB,
} from "../services/subjectService";

import {
  fetchExamHalls as fetchExamHallsFromDB,
  updateExamHalls as updateExamHallsInDB,
  allotExamHalls as allotExamHallsInDB,
  uploadExamHallsFromWorkbook,
} from "../services/examHallService";

import {
  checkSeatingExists,
  fetchExamDataForAllocation,
  saveAllocationData,
  deleteAllocationForSlot,
} from "../services/allocationService";

// Initialize state from localStorage
const user = getUserFromStorage();

export const initialState = {
  isLoading: false,
  alertText: "",
  user: user,
  classCapacity: {},
  deptStrength: {},
  letStrength: {},
  exams: {},
  sup: {},
  drop: [],
  rejoin: {},
  slots: {},
  examToday: [],
  noticeBoardView: {},
  deptView: {},
  classroomView: [],
  attendanceView: [],
  classNames: [],
  singleClassView: [],
  singleAttendanceView: [],
  singleClassName: "",
  selectedSlotName: "",
  dateTime: "",
  academicYear: null,
  deptStart: {},
};

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [messageApi, contextHolder] = message.useMessage();

  const showAlert = (type, content) => {
    messageApi.open({ key: "same_key", type, content });
  };

  const setupUser = async ({ currentUser, endPoint }) => {
    showAlert("loading", "Authenticating...");
    const { username, email, password } = currentUser;

    dispatch({ type: SETUP_USER_BEGIN });

    try {
      let user;
      if (endPoint === "register") {
        user = await registerUser(username, email, password);
      } else {
        user = await loginUser(email, password);
      }

      dispatch({ type: SETUP_USER_SUCCESS, payload: { user } });
      saveUserToStorage(user);
      showAlert("success", "Login Successful!");
    } catch (error) {
      const errormsg = error.message.split("/")[1] || error.message;
      dispatch({ type: SETUP_USER_ERROR });
      showAlert("error", errormsg);
    }
  };

  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER });
    removeUserFromStorage();
  };

  const batchesForm = async (depts) => {
    showAlert("loading", "Updating Batch Details ...");
    try {
      await saveBatchDetails(depts);
      showAlert("success", "Batch Details Updated Successfully!");
    } catch (error) {
      showAlert("error", error.message);
      throw error;
    }
  };

  const fetchBatches = async (academicYear) => {
    showAlert("loading", "Fetching Batches ...");
    try {
      return await fetchBatchDetails(academicYear);
    } catch (error) {
      showAlert("error", error.message);
      return [];
    }
  };

  const updateBatches = async (data) => {
    showAlert("loading", "Updating Batches ...");
    try {
      await updateBatchDetails(data);
      showAlert("success", "Batches Updated Successfully!");
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const fetchAcademicYear = async () => {
    try {
      const academicYear = await fetchAcademicYearFromDB();
      dispatch({
        type: SET_ACADEMIC_YEAR,
        payload: { academicYear },
      });
    } catch (error) {
      console.error("Error fetching academic year:", error);
    }
  };

  const updateAcademicYear = async (academicYear, prevYear) => {
    showAlert("loading", `Updating year to ${academicYear.year()}`);
    try {
      await updateAcademicYearInDB(academicYear);
      dispatch({
        type: SET_ACADEMIC_YEAR,
        payload: { academicYear },
      });
      showAlert("success", `Academic year changed to ${academicYear.year()}`);
    } catch (error) {
      dispatch({
        type: SET_ACADEMIC_YEAR,
        payload: { academicYear: prevYear },
      });
      showAlert("error", error.message);
    }
  };

  const fetchExamOptions = async (selectedYear) => {
    showAlert("loading", "Fetching Options ...");
    try {
      return await fetchExamOptionsFromDB(selectedYear);
    } catch (error) {
      showAlert("error", error.message);
      throw error;
    }
  };

  const fetchSlots = async () => {
    showAlert("loading", "Fetching Slots ...");
    try {
      return await fetchSlotsFromDB();
    } catch (error) {
      showAlert("error", error.message);
      return [];
    }
  };

  const updateSlots = async (data) => {
    showAlert("loading", "Updating Slots ...");
    try {
      await updateSlotsInDB(data);
      showAlert("success", "Slots Updated Successfully!");
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const fetchslotNames = async () => {
    try {
      const { slotNames, slots } = await fetchSlotNamesFromDB();
      dispatch({
        type: SET_SLOTS,
        payload: { slots },
      });
      return slotNames;
    } catch (error) {
      showAlert("error", error.message);
      return [];
    }
  };

  const fetchSubjects = async () => {
    showAlert("loading", "Fetching Subjects ...");
    try {
      return await fetchSubjectsFromDB();
    } catch (error) {
      showAlert("error", error.message);
      return [];
    }
  };

  const uploadSubFile = async (workbook, updateProgress, cancelToken) => {
    showAlert("loading", "Deleting current academic data ...");
    try {
      await deleteAllAcademicData();
      showAlert("warning", "All academic data deleted!");
      showAlert("loading", "Uploading new file...");

      await uploadSubjectsFromWorkbook(workbook, updateProgress, cancelToken);

      if (cancelToken.current !== false) {
        showAlert("success", "Subjects and slots updated!");
      } else {
        showAlert("warning", "Upload Cancelled!");
      }
    } catch (error) {
      updateProgress(0);
      showAlert("error", error.message);
      throw error;
    }
  };

  const fetchExamHalls = async () => {
    showAlert("loading", "Fetching Exam Halls ...");
    try {
      return await fetchExamHallsFromDB();
    } catch (error) {
      showAlert("error", error.message);
      return [];
    }
  };

  const updateExamHalls = async (data) => {
    showAlert("loading", "Updating Capacity ...");
    try {
      await updateExamHallsInDB(data);
      showAlert("success", "Capacity Updated Successfully!");
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const allotExamHall = async (examhalls) => {
    try {
      await allotExamHallsInDB(examhalls);
    } catch (error) {
      console.error("Error allotting exam halls:", error);
    }
  };

  const uploadExamhallFile = async (workbook, updateProgress, cancelToken) => {
    try {
      await uploadExamHallsFromWorkbook(workbook, updateProgress, cancelToken);
      if (cancelToken.current) {
        showAlert("success", "Classroom and desk data updated!");
      }
    } catch (error) {
      updateProgress(0);
      showAlert("error", error.message);
      throw error;
    }
  };

  const seatingExists = async (slot) => {
    try {
      return await checkSeatingExists(slot);
    } catch (error) {
      console.error("Error checking seating:", error);
      return false;
    }
  };

  const fetchExamData = async (examToday, selectedSlotName, prevslot, slotExists) => {
    dispatch({
      type: SET_SLOT_LOADING,
      payload: { isLoading: true, selectedSlotName: prevslot },
    });

    try {
      const data = await fetchExamDataForAllocation(examToday, selectedSlotName, slotExists);

      dispatch({
        type: SET_ALLOCATION_DETAILS,
        payload: {
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
        },
      });

      if (slotExists) {
        showAlert("loading", `Fetching saved seating for ${selectedSlotName}`);
        return {
          savedClasses: data.savedClasses,
          savedData: data.savedData,
        };
      }
    } catch (error) {
      dispatch({
        type: SET_SLOT_LOADING,
        payload: { isLoading: false, selectedSlotName: prevslot },
      });
      showAlert("warning", error.message);
      return [];
    }
  };

  const setAllocatedData = async (allocatedData, selectedSlotName) => {
    if (allocatedData && selectedSlotName) {
      try {
        const result = await saveAllocationData(allocatedData, selectedSlotName);
        dispatch({
          type: SET_ALLOCATED_DATA,
          payload: result,
        });
      } catch (error) {
        console.error("Error saving allocation:", error);
        showAlert("warning", "TRY AGAIN!");
      }
    } else {
      showAlert("warning", "TRY AGAIN!");
    }
  };

  const deleteAllocatedSlot = async (slot) => {
    showAlert("warning", `Deleting Seating for Slot ${slot} ...`);
    try {
      await deleteAllocationForSlot(slot);
    } catch (error) {
      console.error("Error deleting slot:", error);
    }
  };

  const setSingleClassView = (singleClassView, className) => {
    dispatch({
      type: SET_SINGLE_CLASS,
      payload: { singleClassView, singleClassName: className },
    });
  };

  const setSingleAttendance = (singleAttendanceView) => {
    dispatch({
      type: SET_SINGLE_ATTENDANCE,
      payload: { singleAttendanceView },
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        showAlert,
        setupUser,
        logoutUser,
        batchesForm,
        fetchBatches,
        updateBatches,
        fetchAcademicYear,
        updateAcademicYear,
        fetchExamOptions,
        fetchSlots,
        updateSlots,
        fetchslotNames,
        fetchSubjects,
        uploadSubFile,
        fetchExamHalls,
        updateExamHalls,
        allotExamHall,
        uploadExamhallFile,
        seatingExists,
        fetchExamData,
        setAllocatedData,
        deleteAllocatedSlot,
        setSingleClassView,
        setSingleAttendance,
      }}
    >
      {contextHolder}
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, useAppContext };
