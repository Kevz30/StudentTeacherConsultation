// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import type { RootStackParamList } from './src/types/navigation';

import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import StudentHomeScreen from './src/screens/StudentHomeScreen';
import TeacherHomeScreen from './src/screens/TeacherHomeScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import PendingApprovalScreen from './src/screens/PendingApprovalScreen';
import RejectedScreen from './src/screens/RejectedScreen';

// ✅ Admin screens
import ManageTeachersScreen from './src/screens/admin/ManageTeachersScreen';
import UploadScheduleScreen from './src/screens/admin/UploadScheduleScreen';

// ✅ Teacher screens
import TeacherScheduleScreen from './src/screens/teacher/TeacherScheduleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AdminStack = createNativeStackNavigator<RootStackParamList>();
const TeacherStack = createNativeStackNavigator<RootStackParamList>();

// ✅ Admin nested stack
function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminHome" component={AdminDashboardScreen} />
      <AdminStack.Screen name="ManageTeachers" component={ManageTeachersScreen} />
      <AdminStack.Screen name="UploadSchedule" component={UploadScheduleScreen} />
    </AdminStack.Navigator>
  );
}

// ✅ Teacher nested stack
function TeacherStackScreen() {
  return (
    <TeacherStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherStack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <TeacherStack.Screen name="TeacherSchedule" component={TeacherScheduleScreen} />
    </TeacherStack.Navigator>
  );
}

// Unauthenticated screens
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main routing logic
function AppContent() {
  const { user, loading, role, status } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={AuthStack} />
        ) : status === 'pending' && role === 'student' ? (
          <Stack.Screen name="Pending" component={PendingApprovalScreen} />
        ) : status === 'rejected' && role === 'student' ? (
          <Stack.Screen name="Rejected" component={RejectedScreen} />
        ) : role === 'student' ? (
          <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        ) : role === 'teacher' ? (
          <Stack.Screen name="TeacherStack" component={TeacherStackScreen} />
        ) : role === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminStackScreen} />
        ) : (
          <Stack.Screen name="Login" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// App entry point
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}
