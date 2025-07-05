// src/screens/RejectedScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Custom hook to get current user
import { auth } from '../firebase'; // Firebase Auth for logout

export default function RejectedScreen() {
  const { user } = useAuth(); // Get current user info from context

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Registration Rejected</Text>

      {/* Explanation */}
      <Text style={styles.message}>
        Your registration was rejected by the administrator.
        Please contact support@university.edu for assistance.
      </Text>

      {/* Optional display of student ID if available */}
      {user && user.studentId && (
        <Text style={styles.details}>
          Student ID: {user.studentId}
        </Text>
      )}

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={() => auth.signOut()}
        color="#d9534f"
      />
    </View>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8d7da', // Light red for rejected tone
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#721c24',
  },
  details: {
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    color: '#721c24',
  },
});
