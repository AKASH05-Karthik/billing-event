import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useResponsive } from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [responsive, setResponsive] = useState(useResponsive());
  
  // Update responsive values on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setResponsive(useResponsive());
    });
    
    return () => subscription?.remove();
  }, []);

  const handleLogin = () => {
    // Simple validation - you can enhance this
    if (username === 'admin' && password === 'admin123') {
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>VIBRANT</Text>
            <Text style={styles.logoSubtext}>EVENTZ SOLUTION</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={[
          styles.formContainer,
          responsive.isDesktop && {
            maxWidth: 500,
            alignSelf: 'center',
            width: '100%',
          },
          responsive.isTablet && {
            maxWidth: 450,
            alignSelf: 'center',
            width: '100%',
          }
        ]}>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Sign in to manage your events</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.credentialsHint}>
            <Text style={styles.hintText}>Demo Credentials:</Text>
            <Text style={styles.hintText}>Username: admin</Text>
            <Text style={styles.hintText}>Password: admin123</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ea5e9',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#0284c7',
    marginTop: 5,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  credentialsHint: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 2,
  },
});
