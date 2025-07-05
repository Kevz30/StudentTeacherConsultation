import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import type { DocumentPickerAsset } from 'expo-document-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadSchedule'>;

export default function UploadScheduleScreen({ route, navigation }: Props) {
  const { teacherId } = route.params;
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<DocumentPickerAsset | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);

  // 📁 Step 1: Pick Excel file
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/octet-stream',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSchedule(file);
        parseExcel(file.uri);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  // 📊 Step 2: Parse Excel file
  const parseExcel = async (uri: string) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 1, // skip headers
        blankrows: false,
      });

      setParsedData(data);
    } catch (error) {
      console.error('Error parsing Excel:', error);
    }
  };

  // 💾 Step 3: Save extracted schedule to Firestore
  const uploadSchedule = async () => {
    if (!parsedData.length || !teacherId) return;

    setLoading(true);
    try {
      const occupiedSlots = extractOccupiedSlots(parsedData);
      const availableSlots = generateAvailableSlots(occupiedSlots);

      await updateDoc(doc(db, 'users', teacherId), {
        occupiedSlots,
        availableSlots,
      });

      Alert.alert('Success', 'Schedule saved to Firestore!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Extract occupied slots
  const extractOccupiedSlots = (data: any[]) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const occupiedSlots: any[] = [];

    data.forEach((row) => {
      const timeSlot = row[0];
      if (!timeSlot) return;

      for (let i = 1; i <= 5; i++) {
        if (row[i] && row[i].trim() !== '') {
          occupiedSlots.push({
            day: days[i - 1],
            timeSlot,
            subject: row[i],
          });
        }
      }
    });

    return occupiedSlots;
  };

  // 🧠 Generate available slots
  const generateAvailableSlots = (occupiedSlots: any[]) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '7:00-7:30', '7:30-8:00', '8:00-8:30', '8:30-9:00',
      '9:00-9:30', '9:30-10:00', '10:00-10:30', '10:30-11:00',
      '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00',
      '13:00-13:30', '13:30-14:00', '14:00-14:30', '14:30-15:00',
      '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
    ];

    const availableSlots: any[] = [];

    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        const isOccupied = occupiedSlots.some(
          slot => slot.day === day && slot.timeSlot === timeSlot
        );

        if (!isOccupied) {
          availableSlots.push({
            day,
            timeSlot,
            status: 'available',
          });
        }
      });
    });

    return availableSlots;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Teacher Schedule</Text>

      <Button title="Select Excel File" onPress={pickDocument} disabled={loading} />

      {schedule && (
        <Text style={styles.fileInfo}>Selected: {schedule.name}</Text>
      )}

      {parsedData.length > 0 && (
        <View style={styles.preview}>
          <Text>Preview (first 5 rows):</Text>
          {parsedData.slice(0, 5).map((row, i) => (
            <Text key={i}>{JSON.stringify(row)}</Text>
          ))}
        </View>
      )}

      <Button
        title={loading ? 'Saving...' : 'Save Schedule'}
        onPress={uploadSchedule}
        disabled={loading || !parsedData.length}
      />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 10 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  fileInfo: { marginVertical: 10, fontStyle: 'italic' },
  preview: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 15,
    borderRadius: 5,
  },
});
// Styles for the UploadScheduleScreen