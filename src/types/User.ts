export type User = {
  id?: string; // Firebase Auth UID
  name: string;
  studentId?: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "pending" | "approved";
  corUrl?: string;
  createdAt?: Date;
  subjects?: string[];
  scheduleUrl?: string;

  // ✅ NEW: Teacher availability
  availableSlots?: Array<{
    day: string;
    timeSlot: string;
    status: 'available' | 'booked';
  }>;
};
