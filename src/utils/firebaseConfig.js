import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// US
const firebaseConfig = {
  apiKey: "AIzaSyCZ0WIjGromYtVY-YCaObnwFDkSK7dviVQ",
  authDomain: "exam-seat.firebaseapp.com",
  projectId: "exam-seat",
  storageBucket: "exam-seat.appspot.com",
  messagingSenderId: "526070761477",
  appId: "1:526070761477:web:b9aeba458e5b4634f5b46c",
  measurementId: "G-RQ2Z20YF5X",
};

// // india
// const firebaseConfig = {
//   apiKey: "AIzaSyB782w1EfTN82tJw2jcOaBdBGSz_dYYzc0",
//   authDomain: "exam-seat1.firebaseapp.com",
//   projectId: "exam-seat1",
//   storageBucket: "exam-seat1.appspot.com",
//   messagingSenderId: "878198270246",
//   appId: "1:878198270246:web:ab2daa3e674255ed6d79e7",
// };


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);




