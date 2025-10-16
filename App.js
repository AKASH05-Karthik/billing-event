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
        margin: 10mm;
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
      
      /* Hide everything by default */
      body * {
        display: none !important;
      }
      
      /* Show only the company details section - try multiple selectors */
      #company-details-section,
      [data-testid="company-details-section"],
      div[id="company-details-section"] {
        display: block !important;
        position: relative !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 20px !important;
        margin: 0 !important;
        background: white !important;
        text-align: center !important;
        font-family: Arial, sans-serif !important;
      }
      
      /* Show all children of company details */
      #company-details-section *,
      [data-testid="company-details-section"] *,
      div[id="company-details-section"] * {
        display: block !important;
        color: black !important;
        background: white !important;
      }
      
      /* Alternative approach - show specific content by class */
      .print-company-section,
      .print-company-logo,
      .print-company-name,
      .print-company-info {
        display: block !important;
        color: black !important;
        background: white !important;
        margin: 10px 0 !important;
        text-align: center !important;
      }
      
      .print-company-section * {
        display: block !important;
        color: black !important;
        background: white !important;
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
