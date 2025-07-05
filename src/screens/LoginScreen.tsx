import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Firebase Auth instance
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

// Define props type for navigation
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// LoginScreen component receives navigation prop from React Navigation
export default function LoginScreen({ navigation }: Props) {
  // Local state for email, password, and loading indicator
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle login logic
  const handleLogin = async () => {
    // Check if email and password are entered
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true); // Show loading indicator

    try {
      // Attempt to sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // No need to navigate manually, we'll handle this in the auth listener later
    } catch (error: any) {
      // Handle specific login errors
      let message = "Login failed";
      if (error.code === "auth/user-not-found") {
        message = "User not found";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password";
      }
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {/* App Title */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Student-Teacher Consultation
      </Text>
      
      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }}
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, marginBottom: 20, borderRadius: 8 }}
      />
      
      {/* Show loading spinner or Login button */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      
      {/* Navigate to Register Screen */}
      <View style={{ marginTop: 20 }}>
        <Button 
          title="Don't have an account? Register" 
          onPress={() => navigation.navigate('Register')} 
          color="#888"
        />
      </View>
    </View>
  );
}
