import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import XLSX from 'xlsx';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function TeacherScheduleScreen() {
  const { user, refreshUser } = useAuth(); // ✅ Single call to useAuth

  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<
    {
      day: string;
      timeSlot: string;
      status: 'available' | 'booked';
    }[]
  >([]);

  useEffect(() => {
    if (user?.availableSlots) {
      setAvailableSlots(user.availableSlots);
    }
  }, [user]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result?.assets || result.assets.length === 0) {
        Alert.alert('Cancelled', 'No file selected.');
        return;
      }

      const file = result.assets[0];
      setSchedule(file);
      parseExcel(file.uri);
    } catch (error) {
      console.error('Error picking document: ', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const parseExcel = async (uri: string) => {
    try {
      setLoading(true);
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 1,
        blankrows: false,
      });

      setParsedData(data);
      generateAvailableSlots(data);
    } catch (error) {
      console.error('Error parsing Excel: ', error);
      Alert.alert('Error', 'Failed to parse Excel file');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableSlots = (data: any[]) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '7:00-7:30', '7:30-8:00', '8:00-8:30', '8:30-9:00',
    '9:00-9:30', '9:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00',
    '13:00-13:30', '13:30-14:00', '14:00-14:30', '14:30-15:00',
    '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
  ];

  const newAvailableSlots: {
    day: string;
    timeSlot: string;
    status: 'available' | 'booked';
  }[] = [];

  timeSlots.forEach((timeSlot) => {
    const normalize = (t: string) => {
  const [start] = t.split('-');
  const [hourStr, minuteStr] = start.split(':');
  const hour = parseInt(hourStr, 10);
  const normalizedHour = hour <= 6 ? hour + 12 : hour; // 1:00–6:30PM = 13:00–18:30
  return t.replace(/^(\d+):/, `${normalizedHour}:`);
};

const row = data.find((r) => {
  if (!r[0]) return false;
  const normalizedCell = normalize(r[0]);
  return normalizedCell === timeSlot;
});

    if (!row) return;

    days.forEach((day, index) => {
      const cellValue = row[index + 1];
      if (!cellValue || (typeof cellValue === 'string' && cellValue.trim() === '')) {
        newAvailableSlots.push({
          day,
          timeSlot,
          status: 'available',
        });
      }
    });
  });

  setAvailableSlots(newAvailableSlots);
};


  const uploadSchedule = async () => {
    if (!schedule || !user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(schedule.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `schedules/${user.id}/${schedule.name}`);
      await uploadBytes(storageRef, blob);
      const scheduleUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.id), {
        scheduleUrl,
        availableSlots,
      });

      await refreshUser(); // ✅ refresh context with new data

      Alert.alert('Success', 'Schedule uploaded successfully!');
    } catch (error) {
      console.error('Upload failed: ', error);
      Alert.alert('Error', 'Failed to upload schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Consultation Availability</Text>

      <Button
        title="Upload Schedule Excel"
        onPress={pickDocument}
        disabled={loading}
      />

      {schedule && (
        <Text style={styles.fileInfo}>Selected: {schedule.name}</Text>
      )}

      {availableSlots.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots:</Text>
          <FlatList
            data={availableSlots}
            keyExtractor={(item, index) => `${item.day}-${item.timeSlot}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.slotItem}>
                <Text>{item.day} - {item.timeSlot}</Text>
              </View>
            )}
          />
        </View>
      )}

      {availableSlots.length > 0 && (
        <Button
          title={loading ? 'Saving...' : 'Save Availability'}
          onPress={uploadSchedule}
          disabled={loading}
        />
      )}

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fileInfo: {
    marginVertical: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slotItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
// This screen allows teachers to upload their consultation schedules
// It fetches the user's available slots and allows them to upload an Excel file with their schedule