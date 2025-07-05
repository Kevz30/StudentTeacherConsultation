import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types/User';

// This screen allows new users to register by providing their details and uploading a Certificate of Registration (COR) image.
export default function RegisterScreen() {
  // Local state variables
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [corImage, setCorImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to allow the user to pick an image from their gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload COR');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCorImage(result.assets[0].uri); // Save selected image URI
    }
  };

  // Function to handle registration logic
  const handleRegister = async () => {
    // Validate all fields are filled
    if (!name || !studentId || !email || !password || !corImage) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Prepare user data to store in Firestore
      const userData: User = {
        name,
        studentId,
        email,
        role: "student",
        status: "pending",
        corUrl: corImage, // Currently a local URI, we'll handle upload later
        createdAt: new Date(),
      };

      // 3. Save user document to Firestore
      await setDoc(doc(db, "users", uid), userData);

      // ✅ 4. Auto-login user after registration
      await signInWithEmailAndPassword(auth, email, password);

      // 5. Show success message
      Alert.alert("Success", "Registration submitted for approval!");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {/* Input for full name */}
      <TextInput 
        placeholder="Full Name" 
        value={name} 
        onChangeText={setName} 
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      {/* Input for student ID */}
      <TextInput 
        placeholder="Student ID" 
        value={studentId} 
        onChangeText={setStudentId} 
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      {/* Input for email */}
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      {/* Input for password */}
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      {/* COR image picker */}
      <Button title="Select COR Image" onPress={pickImage} />
      {corImage && <Text style={{ marginVertical: 10 }}>✓ Image selected</Text>}
      
      {/* Submit or loading indicator */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
    </View>
  );
}
