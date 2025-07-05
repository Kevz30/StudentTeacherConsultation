// src/screens/PendingApprovalScreen.tsx

import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export default function PendingApprovalScreen() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 20 }}>
        Your account is pending approval by the admin.
      </Text>
      <Text style={{ textAlign: 'center', marginBottom: 20 }}>
        We'll notify you once your Certificate of Registration has been verified.
      </Text>
      <Button 
        title="Logout" 
        onPress={() => auth.signOut()} 
      />
    </View>
  );
}
// This screen is displayed to users whose accounts are pending approval.
// It informs them that their account is awaiting admin approval and provides a logout option.    