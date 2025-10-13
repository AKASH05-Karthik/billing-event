import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useResponsive } from '../utils/responsive';

export default function DashboardScreen({ navigation }) {
  const [bills, setBills] = useState([]);
  const [responsive, setResponsive] = useState(useResponsive());
  
  // Update responsive values on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setResponsive(useResponsive());
    });
    
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadBills();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBills();
    }, [])
  );

  const loadBills = async () => {
    try {
      const storedBills = await AsyncStorage.getItem('bills');
      if (storedBills) {
        setBills(JSON.parse(storedBills));
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        navigation.replace('Login');
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            onPress: () => navigation.replace('Login'),
          },
        ]
      );
    }
  };

  const deleteBill = async (invoiceNo) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this bill?');
      if (confirmed) {
        const updatedBills = bills.filter(bill => bill.invoiceNo !== invoiceNo);
        setBills(updatedBills);
        await AsyncStorage.setItem('bills', JSON.stringify(updatedBills));
      }
    } else {
      Alert.alert(
        'Delete Bill',
        'Are you sure you want to delete this bill?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updatedBills = bills.filter(bill => bill.invoiceNo !== invoiceNo);
              setBills(updatedBills);
              await AsyncStorage.setItem('bills', JSON.stringify(updatedBills));
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Vibrant Eventz Solution</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          responsive.isDesktop && {
            maxWidth: responsive.containerMaxWidth,
            alignSelf: 'center',
            width: '100%',
          }
        ]}
      >
        {/* Stats Cards */}
        <View style={[
          styles.statsContainer,
          responsive.isDesktop && { flexDirection: 'row', flexWrap: 'wrap' }
        ]}>
          <View style={[
            styles.statCard, 
            { backgroundColor: '#dbeafe' },
            responsive.isDesktop && { flex: 1, minWidth: 250 }
          ]}>
            <Text style={styles.statNumber}>{bills.length}</Text>
            <Text style={styles.statLabel}>Total Bills</Text>
          </View>
          <View style={[
            styles.statCard, 
            { backgroundColor: '#d1fae5' },
            responsive.isDesktop && { flex: 1, minWidth: 250 }
          ]}>
            <Text style={styles.statNumber}>
              ₹{bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[
          styles.actionContainer,
          responsive.isDesktop && { maxWidth: 400, alignSelf: 'center' }
        ]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateBill', { onBillCreated: loadBills })}
          >
            <Text style={styles.primaryButtonText}>+ Create New Bill</Text>
          </TouchableOpacity>
        </View>

        {/* Bills List */}
        <View style={styles.billsSection}>
          <Text style={styles.sectionTitle}>Recent Bills</Text>
          <View style={[
            styles.billsGrid,
            responsive.isDesktop && { flexDirection: 'row', flexWrap: 'wrap' }
          ]}>
            {bills.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No bills created yet</Text>
                <Text style={styles.emptySubtext}>Create your first bill to get started</Text>
              </View>
            ) : (
              bills.map((bill, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.billCard,
                    responsive.isDesktop && { 
                      width: `${100 / responsive.gridColumns - 2}%`,
                      marginHorizontal: '1%'
                    }
                  ]}
                >
                  <View style={styles.billHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.billInvoice}>Invoice: {bill.invoiceNo}</Text>
                      <Text style={styles.billClient}>{bill.clientName}</Text>
                      <Text style={styles.billDate}>{bill.date}</Text>
                    </View>
                    <View style={styles.billActions}>
                      <Text style={styles.billAmount}>₹{bill.grandTotal?.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                  <View style={styles.billFooter}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => navigation.navigate('Billing', { bill })}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteBill(bill.invoiceNo)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0ea5e9',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0f2fe',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  billsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  billsGrid: {
    flexDirection: 'column',
  },
  billsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  billCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billInvoice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  billClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 4,
  },
  billDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  billFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
