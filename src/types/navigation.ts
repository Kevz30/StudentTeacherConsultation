export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  StudentHome: undefined;
  TeacherHome: undefined;
  TeacherSchedule: undefined; // ✅ Add this
  TeacherStack: undefined; // ✅ And this
  AdminHome: undefined;
  ManageTeachers: undefined;
  UploadSchedule: { teacherId?: string }; // For admin or teacher
  Pending: undefined;
  Rejected: undefined;
};
