export type User = {
  id?: string;
  name: string;
  studentId: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "pending" | "approved";
  corUrl: string; // Will store local image URI for now
};