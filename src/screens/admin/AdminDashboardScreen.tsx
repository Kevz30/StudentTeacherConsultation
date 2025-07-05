import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  StyleSheet,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Firebase Firestore and Auth
import { User } from '../../types/User';  // User type interface

// Admin Dashboard Screen
// This shows a list of pending students
// Admin can approve or reject each student
export default function AdminDashboardScreen() {
  const [pendingStudents, setPendingStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending students when the screen mounts
  useEffect(() => {
    fetchPendingStudents();
  }, []);

  // Fetch students from Firestore with status 'pending'
  const fetchPendingStudents = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);

      const students: User[] = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as User),
      }));

      setPendingStudents(students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Approve a student by updating their Firestore status
  const approveStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        status: 'approved',
      });
      // Remove from local state
      setPendingStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  // Reject a student by updating their Firestore status
  const rejectStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        status: 'rejected',
      });
      // Remove from local state
      setPendingStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  // While loading, show spinner
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logout button */}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={() => auth.signOut()} color="#666" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Pending Student Approvals</Text>

      {/* List of students or empty message */}
      {pendingStudents.length === 0 ? (
        <Text style={styles.emptyText}>No pending registrations</Text>
      ) : (
        <FlatList
          data={pendingStudents}
          keyExtractor={item => item.id!}
          renderItem={({ item }) => (
            <View style={styles.studentCard}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>ID: {item.studentId}</Text>
              <Text>Email: {item.email}</Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Approve"
                  onPress={() => approveStudent(item.id!)}
                  color="green"
                />
                <Button
                  title="Reject"
                  onPress={() => rejectStudent(item.id!)}
                  color="red"
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logoutContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
