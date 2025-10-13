import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BillingScreen from './src/screens/BillingScreen';
import CreateBillScreen from './src/screens/CreateBillScreen';

// Add responsive meta tags and styles for web
if (Platform.OS === 'web') {
  // Add viewport meta tag for responsive design
  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
  document.head.appendChild(viewport);
  
  // Add responsive and print styles
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      @page {
        margin: 5mm;
        size: A4 portrait;
      }
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      html, body {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Hide all body children initially */
      body * {
        visibility: hidden !important;
      }
      
      /* Show only invoice content and its children */
      #invoice-content-for-pdf,
      #invoice-content-for-pdf * {
        visibility: visible !important;
      }
      
      /* Force hide specific elements even if inside invoice */
      #action-buttons-container,
      #action-buttons-container *,
      button,
      button * {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Position and style invoice for single page */
      #invoice-content-for-pdf {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 200mm !important;
        max-width: 200mm !important;
        padding: 8mm !important;
        margin: 0 !important;
        background: white !important;
        box-sizing: border-box !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        transform: scale(0.88) !important;
        transform-origin: top left !important;
      }
    }
  `;
  document.head.appendChild(style);
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Billing" component={BillingScreen} />
          <Stack.Screen name="CreateBill" component={CreateBillScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
