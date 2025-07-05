import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types/User';

// ✅ Define the shape of our context, now includes refreshUser
interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'student' | 'teacher' | 'admin' | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  refreshUser: () => Promise<void>; // ✅ Add refreshUser
}

// ✅ Create a context with default empty values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  status: null,
  refreshUser: async () => {}, // Placeholder for default
});

// ✅ AuthProvider will wrap your entire app to provide global access to auth state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Function to manually refresh user data from Firestore
  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const docRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(docRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      setUser({ ...userData, id: currentUser.uid });
    }
  };

  useEffect(() => {
    // ✅ Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
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
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role ?? null,
        status: user?.status ?? null,
        refreshUser, // ✅ Pass it into the context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook to access the AuthContext anywhere
export const useAuth = () => useContext(AuthContext);
