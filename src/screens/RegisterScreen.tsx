import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types/User';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [corImage, setCorImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload COR');
      return;
    }

    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCorImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!name || !studentId || !email || !password || !corImage) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Save user data to Firestore (with local image URI)
      const userData: User = {
        name,
        studentId,
        email,
        role: "student",
        status: "pending",
        corUrl: corImage // Storing local URI temporarily
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      Alert.alert("Success", "Registration submitted for approval!");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput 
        placeholder="Full Name" 
        value={name} 
        onChangeText={setName} 
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput 
        placeholder="Student ID" 
        value={studentId} 
        onChangeText={setStudentId} 
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      <Button title="Select COR Image" onPress={pickImage} />
      {corImage && <Text style={{ marginVertical: 10 }}>✓ Image selected</Text>}
      
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
    </View>
  );
}