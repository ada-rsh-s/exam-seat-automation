import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const env = import.meta.env;

// const firebaseConfig = {
//   apiKey: env.VITE_API_KEY,
//   authDomain: env.VITE_AUTH_DOMAIN,
//   projectId: env.VITE_PROJECT_ID,
//   storageBucket: env.VITE_STORAGE_BUCKET,
//   messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
//   appId: env.VITE_APP_ID,
// };

//development mode
const firebaseConfig = {
  apiKey: "AIzaSyA-GEd3OjTP8ngLNKnMbnjEUb4FNxUlFLY",
  authDomain: "asientomatic.firebaseapp.com",
  projectId: "asientomatic",
  storageBucket: "asientomatic.firebasestorage.app",
  messagingSenderId: "174229598796",
  appId: "1:174229598796:web:75a3d96a4f66435be1bae9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
