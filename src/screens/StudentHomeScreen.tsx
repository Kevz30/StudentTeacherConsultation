import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function StudentHomeScreen() {
  const { user } = useAuth();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {user?.name}!</Text>
      <Text>Student ID: {user?.studentId}</Text>
      <Text>Status: {user?.status}</Text>
      <Text>Role: {user?.role}</Text>
    </View>
  );
}