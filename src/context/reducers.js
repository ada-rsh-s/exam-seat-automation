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
import { initialState } from "./AppContext";
const reducer = (state, action) => {
  switch (action.type) {
    case SETUP_USER_BEGIN:
      return { ...state, isLoading: true };

    case SETUP_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
      };

    case SETUP_USER_ERROR:
      return {
        ...state,
        isLoading: false,
      };
    case LOGOUT_USER:
      return {
        ...initialState,
        user: null,
      };
    case SET_SLOTS:
      return {
        ...state,
        slots: action.payload.slots,
      };
    case SET_ALLOCATION_DETAILS:
      return {
        ...state,
        classCapacity: action.payload.classCapacity,
        deptStrength: action.payload.deptStrength,
        letStrength: action.payload.letStrength,
        exams: action.payload.exams,
        drop: action.payload.drop,
        rejoin: action.payload.rejoin,
        examToday: action.payload.examToday,
        selectedSlotName: action.payload.selectedSlotName,
        dateTime: action.payload.dateTime,
      };
    case SET_SLOT_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        selectedSlotName: action.payload.selectedSlotName,
      };
    case SET_ALLOCATED_DATA:
      return {
        ...state,
        noticeBoardView: action.payload.noticeBoardView,
        deptView: action.payload.deptView,
        classroomView: action.payload.classroomView,
        attendanceView: action.payload.attendanceView,
        classNames: action.payload.classNames,
        isLoading: false,
      };
    case SET_SINGLE_CLASS:
      return {
        ...state,
        singleClassView: action.payload.singleClassView,
        singleClassName: action.payload.singleClassName,
      };
    case SET_SINGLE_ATTENDANCE:
      return {
        ...state,
        singleAttendanceView: action.payload.singleAttendanceView,
      };
    case SET_ACADEMIC_YEAR:
      return {
        ...state,
        academicYear: action.payload.academicYear,
      };

    default:
      throw new Error(`Undefined Action :${action.type}`);
  }
};
export default reducer;
