// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types/User';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'student' | 'teacher' | 'admin' | null;
  status: 'pending' | 'approved' | 'rejected' | null; // Include 'rejected'
}

// Create a context with default empty values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  status: null,
});

// AuthProvider will wrap your entire app to provide global access to auth state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get user data from Firestore using the Firebase Auth UID
        const docRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({ ...userData, id: firebaseUser.uid });
        } else {
          console.warn('No Firestore user document found');
          setUser(null);
        }
      } else {
        setUser(null); // Not logged in
      }

      setLoading(false); // Stop loading once data is retrieved
    });

    return unsubscribe; // Cleanup the listener when component unmounts
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

// Hook to use AuthContext in other components
export const useAuth = () => useContext(AuthContext);
