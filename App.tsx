// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';

// Import typed navigation param list
import type { RootStackParamList } from './src/types/navigation';

// Import screens
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import StudentHomeScreen from './src/screens/StudentHomeScreen';
import TeacherHomeScreen from './src/screens/TeacherHomeScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import PendingApprovalScreen from './src/screens/PendingApprovalScreen';

// Use the typed stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Stack for unauthenticated users (login/register)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main navigator based on auth status
function AppContent() {
  const { user, loading, role, status } = useAuth(); // Get current user state from context

  // While user data is loading
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
          // If no user is logged in, show Auth stack
          <Stack.Screen name="Login" component={AuthStack} />
        ) : status === 'pending' && role === 'student' ? (
          // Student account is pending approval
          <Stack.Screen name="Pending" component={PendingApprovalScreen} />
        ) : role === 'student' ? (
          <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        ) : role === 'teacher' ? (
          <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
        ) : role === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        ) : (
          // Fallback
          <Stack.Screen name="Login" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// App root wrapped with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}
