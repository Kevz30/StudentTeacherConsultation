// src/screens/TeacherHomeScreen.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function TeacherHomeScreen() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, Teacher {user?.name}!</Text>
    </View>
  );
}
