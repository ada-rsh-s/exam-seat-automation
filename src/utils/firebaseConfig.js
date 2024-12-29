import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
};

  // const firebaseConfig = {
  //   apiKey: "AIzaSyCRSrTvxTmaHyyw4W_dyKgW17viY1vmdgI",
  //   authDomain: "asientomatic-test.firebaseapp.com",
  //   projectId: "asientomatic-test",
  //   storageBucket: "asientomatic-test.appspot.com",
  //   messagingSenderId: "896321721448",
  //   appId: "1:896321721448:web:6d291369fbde4fcd2557dd",
  // };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
