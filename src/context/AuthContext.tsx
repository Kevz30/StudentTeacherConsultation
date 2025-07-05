import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types/User';

// Define the shape of our AuthContext
interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: "student" | "teacher" | "admin" | null;
  status: "pending" | "approved" | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  status: null,
});

// Provider component that wraps the app and makes auth state available
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for changes in Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({ ...userData, id: firebaseUser.uid });
        } else {
          console.log("User document not found");
          setUser(null);
        }
      } else {
        // No user is signed in
        setUser(null);
      }
      setLoading(false); // Stop loading once auth state is determined
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role ?? null,
        status: user?.status ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);
