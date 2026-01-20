/**
 * Authentication Service
 * Handles all Firebase authentication operations
 */
import { auth, db } from "../utils/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";

/**
 * Login user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{username: string, email: string}>}
 */
export const loginUser = async (email, password) => {
    const data = await signInWithEmailAndPassword(auth, email, password);
    const userEmail = data.user.email;

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    let user = {};
    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            const { username, email } = doc.data();
            user = { username, email };
        });
    }

    return user;
};

/**
 * Register a new user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{username: string, email: string}>}
 */
export const registerUser = async (username, email, password) => {
    const data = await createUserWithEmailAndPassword(auth, email, password);
    const createdUser = data.user;

    await setDoc(doc(db, "users", createdUser.uid), {
        username,
        email,
    });

    return { username, email };
};

/**
 * Add user to localStorage
 * @param {object} user 
 */
export const saveUserToStorage = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Remove user from localStorage
 */
export const removeUserFromStorage = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("depts");
    localStorage.removeItem("selectedYear");
};

/**
 * Get user from localStorage
 * @returns {object|null}
 */
export const getUserFromStorage = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};
