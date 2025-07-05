// src/types/User.ts

// This type defines the shape of a user document in Firestore
export type User = {
  id?: string; // Firebase Auth UID, optional because we fetch it separately
  name: string; // Full name of the user
  studentId?: string; // Only required for students
  email: string; // Email used for login
  role: "student" | "teacher" | "admin"; // Determines which screen they'll see
  status: "pending" | "approved"; // For admin approval process (mainly for students)
  corUrl?: string; // Local image URI (for now), only for students
  createdAt?: Date; // Optional: could be added if you're tracking user creation
};
