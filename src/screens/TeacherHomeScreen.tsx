// src/screens/TeacherHomeScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TeacherHome'>;
};

export default function TeacherHomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Teacher {user?.name}!</Text>

      <View style={styles.buttonWrapper}>
        <Button
          title="Manage My Schedule"
          onPress={() => navigation.navigate('TeacherSchedule')}
        />
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title="View My Consultations"
          onPress={() => {}}
          disabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginBottom: 15,
  },
});
