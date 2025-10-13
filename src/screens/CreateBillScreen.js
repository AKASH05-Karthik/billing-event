import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResponsive, getResponsivePadding, responsiveFontSize } from '../utils/responsive';

// Function to convert number to words (Indian numbering system)
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return ones[hundred] + ' Hundred' + (rest > 0 ? ' ' + convertLessThanThousand(rest) : '');
  };
  
  // Handle decimal part
  const parts = num.toFixed(2).split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parseInt(parts[1]);
  
  if (integerPart === 0 && decimalPart === 0) return 'Zero';
  
  let words = '';
  
  // Convert integer part
  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000);
    words += convertLessThanThousand(crores) + ' Crore ';
    const remaining = integerPart % 10000000;
    if (remaining > 0) {
      if (remaining >= 100000) {
        const lakhs = Math.floor(remaining / 100000);
        words += convertLessThanThousand(lakhs) + ' Lakh ';
        const rem = remaining % 100000;
        if (rem >= 1000) {
          const thousands = Math.floor(rem / 1000);
          words += convertLessThanThousand(thousands) + ' Thousand ';
          const final = rem % 1000;
          if (final > 0) words += convertLessThanThousand(final);
        } else if (rem > 0) {
          words += convertLessThanThousand(rem);
        }
      } else if (remaining >= 1000) {
        const thousands = Math.floor(remaining / 1000);
        words += convertLessThanThousand(thousands) + ' Thousand ';
        const final = remaining % 1000;
        if (final > 0) words += convertLessThanThousand(final);
      } else {
        words += convertLessThanThousand(remaining);
      }
    }
  } else if (integerPart >= 100000) {
    const lakhs = Math.floor(integerPart / 100000);
    words += convertLessThanThousand(lakhs) + ' Lakh ';
    const remaining = integerPart % 100000;
    if (remaining >= 1000) {
      const thousands = Math.floor(remaining / 1000);
      words += convertLessThanThousand(thousands) + ' Thousand ';
      const final = remaining % 1000;
      if (final > 0) words += convertLessThanThousand(final);
    } else if (remaining > 0) {
      words += convertLessThanThousand(remaining);
    }
  } else if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    words += convertLessThanThousand(thousands) + ' Thousand ';
    const remaining = integerPart % 1000;
    if (remaining > 0) words += convertLessThanThousand(remaining);
  } else {
    words = convertLessThanThousand(integerPart);
  }
  
  // Add decimal part if exists
  if (decimalPart > 0) {
    words = words.trim() + ' Point ' + convertLessThanThousand(decimalPart);
  }
  
  return words.trim();
};

export default function CreateBillScreen({ navigation, route }) {
  const [currentStep, setCurrentStep] = useState(1);
  const invoiceRef = useRef(null);
  
  // Responsive state
  const [responsive, setResponsive] = useState(useResponsive());
  
  // Update responsive values on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setResponsive(useResponsive());
    });
    
    return () => subscription?.remove();
  }, []);
  
  // Step 1: Invoice Info
  const [invoiceNo, setInvoiceNo] = useState('VESS' + Math.floor(Math.random() * 100000));
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(today.toISOString().split('T')[0]);
  const [hsnCode, setHsnCode] = useState('998599');
  
  // Step 2: Client Details
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGSTIN, setClientGSTIN] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientStateCode, setClientStateCode] = useState('');
  
  // Step 3: Order Info
  const [buyerOrderNo, setBuyerOrderNo] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [dispatchDocNo, setDispatchDocNo] = useState('');
  const [dispatchedThrough, setDispatchedThrough] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [supplierRef, setSupplierRef] = useState('');
  const [otherReferences, setOtherReferences] = useState('');
  
  // Step 4: Items
  const [items, setItems] = useState([
    { description: '', qty: '1', rate: '0', days: '1', unit: 'Nos', amount: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { description: '', qty: '1', rate: '0', days: '1', unit: 'Nos', amount: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Calculate amount
    if (field === 'qty' || field === 'rate' || field === 'days') {
      const qty = parseFloat(newItems[index].qty) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      const days = parseFloat(newItems[index].days) || 1;
      newItems[index].amount = qty * rate * days;
    }
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const roundOff = Math.round(subtotal + cgst + sgst) - (subtotal + cgst + sgst);
    const grandTotal = Math.round(subtotal + cgst + sgst);
    
    return { subtotal, cgst, sgst, roundOff, grandTotal };
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!invoiceNo) {
        showAlert('Required Field', 'Please enter Invoice Number');
        return false;
      }
      if (!date) {
        showAlert('Required Field', 'Please select Invoice Date');
        return false;
      }
    } else if (currentStep === 2) {
      if (!clientName) {
        showAlert('Required Field', 'Please enter Client Name');
        return false;
      }
      if (!clientAddress) {
        showAlert('Required Field', 'Please enter Client Address');
        return false;
      }
    } else if (currentStep === 3) {
      // Order info is optional
    } else if (currentStep === 4) {
      const hasValidItem = items.some(item => item.description && item.qty && item.rate);
      if (!hasValidItem) {
        showAlert('Required Fields', 'Please add at least one item with:\n- Description\n- Quantity\n- Rate');
        return false;
      }
      // Check each item for required fields
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.description || item.qty || item.rate) {
          if (!item.description) {
            showAlert('Required Field', `Item ${i + 1}: Please enter Description`);
            return false;
          }
          if (!item.qty || item.qty === '0') {
            showAlert('Required Field', `Item ${i + 1}: Please enter Quantity`);
            return false;
          }
          if (!item.rate || item.rate === '0') {
            showAlert('Required Field', `Item ${i + 1}: Please enter Rate`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveBill = async () => {
    const totals = calculateTotals();
    const bill = {
      invoiceNo,
      date,
      clientName,
      clientAddress,
      clientGSTIN,
      clientState,
      clientStateCode,
      buyerOrderNo,
      orderDate,
      dispatchDocNo,
      dispatchedThrough,
      destination,
      paymentMode,
      supplierRef,
      otherReferences,
      deliveryDate,
      hsnCode,
      items: items.filter(item => item.description && item.qty && item.rate),
      ...totals,
    };

    try {
      const storedBills = await AsyncStorage.getItem('bills');
      const bills = storedBills ? JSON.parse(storedBills) : [];
      bills.unshift(bill);
      await AsyncStorage.setItem('bills', JSON.stringify(bills));
      
      // Navigate directly to Dashboard without alert
      if (route.params?.onBillCreated) {
        route.params.onBillCreated();
      }
      navigation.navigate('Dashboard');
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to save bill');
      } else {
        Alert.alert('Error', 'Failed to save bill');
      }
    }
  };

  const totals = calculateTotals();

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Invoice Info' },
      { number: 2, label: 'Client Details' },
      { number: 3, label: 'Order Info' },
      { number: 4, label: 'Items' },
      { number: 5, label: 'Review' },
    ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step.number} style={styles.stepContainer}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                currentStep === step.number && styles.stepCircleActive,
                currentStep > step.number && styles.stepCircleCompleted,
              ]}>
                <Text style={[
                  styles.stepNumber,
                  currentStep >= step.number && styles.stepNumberActive,
                ]}>
                  {step.number}
                </Text>
              </View>
              <Text style={[
                styles.stepLabel,
                currentStep === step.number && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                currentStep > step.number && styles.stepLineCompleted,
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Invoice Information</Text>
      <Text style={styles.fieldLabel}>Invoice Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="VESS52566"
        value={invoiceNo}
        onChangeText={setInvoiceNo}
      />
      <Text style={styles.fieldLabel}>Invoice Date *</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 14,
            borderWidth: 1,
            borderColor: '#cbd5e1',
            borderRadius: 8,
            backgroundColor: '#f8fafc',
            marginBottom: 12,
            border: '1px solid #cbd5e1',
          }}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="2025-10-09"
          value={date}
          onChangeText={setDate}
        />
      )}
      <Text style={styles.fieldLabel}>Delivery Date</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 14,
            borderWidth: 1,
            borderColor: '#cbd5e1',
            borderRadius: 8,
            backgroundColor: '#f8fafc',
            marginBottom: 12,
            border: '1px solid #cbd5e1',
          }}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="2025-10-12"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
        />
      )}
      <Text style={styles.fieldLabel}>HSN/SAC Code</Text>
      <TextInput
        style={styles.input}
        placeholder="998599"
        value={hsnCode}
        onChangeText={setHsnCode}
      />
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>💡 Tip: Invoice number is auto-generated but you can customize it. Make sure it's unique!</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Client Details</Text>
      
      <Text style={styles.fieldLabel}>Client Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter client/company name"
        value={clientName}
        onChangeText={setClientName}
      />
      
      <Text style={styles.fieldLabel}>Client Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter complete address"
        value={clientAddress}
        onChangeText={setClientAddress}
        multiline
        numberOfLines={4}
      />
      
      <View style={styles.threeColumnRow}>
        <View style={styles.threeColumnItem}>
          <Text style={styles.fieldLabel}>GSTIN/UIN</Text>
          <TextInput
            style={styles.input}
            placeholder="22AAAAAA0000A1Z5"
            value={clientGSTIN}
            onChangeText={setClientGSTIN}
          />
        </View>
        
        <View style={styles.threeColumnItem}>
          <Text style={styles.fieldLabel}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Tamil Nadu"
            value={clientState}
            onChangeText={setClientState}
          />
        </View>
        
        <View style={styles.threeColumnItem}>
          <Text style={styles.fieldLabel}>State Code</Text>
          <TextInput
            style={styles.input}
            placeholder="33"
            value={clientStateCode}
            onChangeText={setClientStateCode}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Order Information</Text>
      
      <View style={styles.twoColumnRow}>
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Buyer's Order No.</Text>
          <TextInput
            style={styles.input}
            placeholder="PO-001"
            value={buyerOrderNo}
            onChangeText={setBuyerOrderNo}
          />
        </View>
        
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Order Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 14,
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                marginBottom: 12,
                border: '1px solid #cbd5e1',
              }}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="dd-mm-yyyy"
              value={orderDate}
              onChangeText={setOrderDate}
            />
          )}
        </View>
      </View>
      
      <View style={styles.twoColumnRow}>
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Dispatch Doc No.</Text>
          <TextInput
            style={styles.input}
            placeholder="DISP-001"
            value={dispatchDocNo}
            onChangeText={setDispatchDocNo}
          />
        </View>
        
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Dispatched Through</Text>
          <TextInput
            style={styles.input}
            placeholder="Courier/Transport"
            value={dispatchedThrough}
            onChangeText={setDispatchedThrough}
          />
        </View>
      </View>
      
      <View style={styles.twoColumnRow}>
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="City/Location"
            value={destination}
            onChangeText={setDestination}
          />
        </View>
        
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Payment Mode</Text>
          {Platform.OS === 'web' ? (
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 14,
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                marginBottom: 12,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
              <option value="NEFT/RTGS">NEFT/RTGS</option>
            </select>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Cash"
              value={paymentMode}
              onChangeText={setPaymentMode}
            />
          )}
        </View>
      </View>
      
      <View style={styles.twoColumnRow}>
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Supplier's Reference</Text>
          <TextInput
            style={styles.input}
            placeholder="Reference number"
            value={supplierRef}
            onChangeText={setSupplierRef}
          />
        </View>
        
        <View style={styles.twoColumnItem}>
          <Text style={styles.fieldLabel}>Other References</Text>
          <TextInput
            style={styles.input}
            placeholder="Additional references"
            value={otherReferences}
            onChangeText={setOtherReferences}
          />
        </View>
      </View>
      
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          <Text style={styles.noteBold}>Note:</Text> All fields in this step are optional. Fill only if applicable to your invoice.
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.itemsHeader}>
        <Text style={styles.stepTitle}>Invoice Items</Text>
        <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
          <Text style={styles.addItemButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {items.map((item, index) => (
        <View key={index} style={styles.itemCardNew}>
          <View style={styles.itemHeaderNew}>
            <Text style={styles.itemTitleNew}>Item {index + 1}</Text>
            {items.length > 1 && (
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Text style={styles.removeButtonNew}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.fieldLabel}>Description *</Text>
          <TextInput
            style={styles.textAreaNew}
            placeholder="Enter item description"
            value={item.description}
            onChangeText={(value) => updateItem(index, 'description', value)}
            multiline
            numberOfLines={2}
          />
          
          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <Text style={styles.fieldLabel}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={item.qty}
                onChangeText={(value) => updateItem(index, 'qty', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.twoColumnItem}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <TextInput
                style={styles.input}
                placeholder="Nos"
                value={item.unit || ''}
                onChangeText={(value) => {
                  const newItems = [...items];
                  newItems[index].unit = value;
                  setItems(newItems);
                }}
              />
            </View>
          </View>
          
          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <Text style={styles.fieldLabel}>Rate *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={item.rate}
                onChangeText={(value) => updateItem(index, 'rate', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.twoColumnItem}>
              <Text style={styles.fieldLabel}>Days/Period</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={item.days}
                onChangeText={(value) => updateItem(index, 'days', value)}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.itemAmountBox}>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Text style={styles.itemAmountLabel}>Item Amount:</Text>
              <Text style={styles.itemAmountFormula} numberOfLines={2} ellipsizeMode="tail">
                {item.qty || 0} × ₹{Number(item.rate || 0).toLocaleString('en-IN')} × {item.days || 1} days
              </Text>
            </View>
            <Text style={styles.itemAmountValue} numberOfLines={1} adjustsFontSizeToFit>
              ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      ))}
      
      <View style={styles.subtotalBox}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={styles.subtotalLabel}>Subtotal (before tax):</Text>
          <Text style={styles.subtotalNote}>CGST (9%) + SGST (9%) will be added</Text>
        </View>
        <Text style={styles.subtotalValue} numberOfLines={1} adjustsFontSizeToFit>
          ₹{Number(totals.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );

  const handleEdit = () => {
    setCurrentStep(1);
  };

  const handlePDF = async () => {
    if (Platform.OS === 'web') {
      try {
        // Dynamic import for web only
        const jsPDF = (await import('jspdf')).default;
        const html2canvas = (await import('html2canvas')).default;
        
        // Get the review container element by ID
        const element = document.getElementById('invoice-content-for-pdf');
        
        if (!element) {
          window.alert('Unable to generate PDF. Please try again.');
          return;
        }

        // Create a hidden clone for PDF generation
        const clone = element.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.width = '210mm';
        clone.style.maxWidth = '210mm';
        clone.style.backgroundColor = '#ffffff';
        clone.style.padding = '20px';
        clone.style.overflow = 'visible';
        
        // Remove action buttons from clone if they exist
        const cloneButtons = clone.querySelector('#action-buttons-container');
        if (cloneButtons) {
          cloneButtons.remove();
        }
        
        document.body.appendChild(clone);

        // Wait for layout to settle
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate canvas from the hidden clone
        const canvas = await html2canvas(clone, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: clone.scrollHeight,
          width: 794,
          height: clone.scrollHeight,
        });

        // Remove the clone
        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: false,
        });

        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        let imgWidth = pdfWidth;
        let imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Scale to fit on single page if content is too tall
        if (imgHeight > pdfHeight) {
          const scale = pdfHeight / imgHeight;
          imgHeight = pdfHeight;
          imgWidth = imgWidth * scale;
        }
        
        // Center the image on the page
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = 0;
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, '', 'FAST');
        
        pdf.save(`Invoice_${invoiceNo}_${clientName}.pdf`);
        
        window.alert('PDF downloaded successfully!');
      } catch (error) {
        console.error('PDF generation error:', error);
        window.alert('Unable to generate PDF. Please try again.');
      }
    } else {
      Alert.alert('PDF', 'PDF generation is available on web version');
    }
  };

  const handleEmail = () => {
    const subject = `Invoice ${invoiceNo} - Vibrant Eventz Solution`;
    const body = `Dear ${clientName},\n\nPlease find attached your invoice.\n\nInvoice No: ${invoiceNo}\nDate: ${date}\nAmount: ₹${totals.grandTotal}\n\nThank you for your business!\n\nBest regards,\nVibrant Eventz Solution`;
    
    if (Platform.OS === 'web') {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      Alert.alert('Email', 'Opening email client...');
    }
  };

  const handleWhatsApp = () => {
    const message = `*Invoice from Vibrant Eventz Solution*\n\nInvoice No: ${invoiceNo}\nDate: ${date}\nClient: ${clientName}\nAmount: ₹${totals.grandTotal}\n\nThank you for your business!`;
    
    if (Platform.OS === 'web') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      Alert.alert('WhatsApp', 'Opening WhatsApp...');
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert('Print', 'Print feature available on web version');
    }
  };

  const renderStep5 = () => (
    <View style={styles.reviewWrapper}>
      <View style={styles.reviewHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.reviewBackButton}>
          <Text style={styles.reviewBackButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.reviewHeaderTitle}>Invoice Preview</Text>
        <View style={{ width: 60 }}></View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer} nativeID="action-buttons-container">
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Text style={styles.actionButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.pdfButton]}
            onPress={handlePDF}
          >
            <Text style={styles.actionButtonText}>📄 PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.emailButton]}
            onPress={handleEmail}
          >
            <Text style={styles.actionButtonText}>📧 Email</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={handleWhatsApp}
          >
            <Text style={styles.actionButtonText}>💬 WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.printButton]}
            onPress={handlePrint}
          >
            <Text style={styles.actionButtonText}>🖨️ Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.reviewContainer}>
      <View nativeID="invoice-content-for-pdf" style={styles.pdfContentWrapper}>
      {/* Logo Header */}
      <View style={styles.reviewLogoSection}>
        <View style={styles.reviewLogo}>
          <Text style={styles.reviewLogoText}>V</Text>
        </View>
        <Text style={styles.reviewCompanyName}>VIBRANT EVENTZ SOLUTION</Text>
        <Text style={styles.reviewTagline}>EVERYTHING IS POSSIBLE</Text>
      </View>

      {/* Tax Invoice Header */}
      <View style={styles.reviewInvoiceHeader}>
        <Text style={styles.reviewInvoiceTitle}>Tax Invoice</Text>
        <Text style={styles.reviewOriginal}>Original</Text>
      </View>

      {/* Company and Invoice Info */}
      <View style={styles.reviewInfoGrid}>
        <View style={styles.reviewInfoLeft}>
          <Text style={styles.reviewInfoTitle}>Vibrant Eventz Solution</Text>
          <Text style={styles.reviewInfoText}>D/NO 25,NEW NO.1,GROUND FLOOR,BHARATHIYAR</Text>
          <Text style={styles.reviewInfoText}>IST STREET,TIRUALLA,TIRUCHIRAPALLI,TAMILNADU</Text>
          <Text style={styles.reviewInfoText}>PHONE: 6380001</Text>
          <Text style={styles.reviewInfoText}>Email: Travel Nadu</Text>
          <Text style={styles.reviewInfoText}>GSTIN/UIN: 33AACFV3551122</Text>
          <Text style={styles.reviewInfoText}>State Name: Tamil Nadu, Code: 33</Text>
        </View>
        <View style={styles.reviewInfoRight}>
          <View style={styles.reviewInfoRow}>
            <Text style={styles.reviewInfoLabel}>Invoice No.</Text>
            <Text style={styles.reviewInfoValue}>{invoiceNo}</Text>
          </View>
          <View style={styles.reviewInfoRow}>
            <Text style={styles.reviewInfoLabel}>Dated</Text>
            <Text style={styles.reviewInfoValue}>{date}</Text>
          </View>
          <View style={styles.reviewInfoRow}>
            <Text style={styles.reviewInfoLabel}>Delivery Note</Text>
            <Text style={styles.reviewInfoValue}>{deliveryDate || '2025-10-12'}</Text>
          </View>
        </View>
      </View>

      {/* Buyer Info */}
      <View style={styles.reviewBuyerSection}>
        <Text style={styles.reviewInfoTitle}>Buyer (Bill to)</Text>
        <Text style={styles.reviewBuyerName}>{clientName || 'ceffeeeec'}</Text>
        <Text style={styles.reviewBuyerText}>{clientAddress || 'eee'}</Text>
        <Text style={styles.reviewBuyerText}>GSTIN/UIN: {clientGSTIN || 'N/A'}</Text>
        <Text style={styles.reviewBuyerText}>State Name: {clientState || 'N/A'}</Text>
      </View>

      {/* Order Details Grid */}
      <View style={styles.reviewOrderGrid}>
        <View style={styles.reviewOrderLeft}>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Buyer's Order No.</Text>
            <Text style={styles.reviewOrderValue}>{buyerOrderNo || 'wdsc'}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Dated</Text>
            <Text style={styles.reviewOrderValue}>{orderDate || '2025-10-10'}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Dispatch Doc No.</Text>
            <Text style={styles.reviewOrderValue}>{dispatchDocNo || 'swdc'}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Dispatched through</Text>
            <Text style={styles.reviewOrderValue}>{dispatchedThrough || 'wscf'}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Destination</Text>
            <Text style={styles.reviewOrderValue}>{destination || 'sxws'}</Text>
          </View>
        </View>
        <View style={styles.reviewOrderRight}>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Mode/Terms of Payment</Text>
            <Text style={styles.reviewOrderValue}>{paymentMode}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Supplier's Ref</Text>
            <Text style={styles.reviewOrderValue}>{supplierRef || 'scf'}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Other References</Text>
            <Text style={styles.reviewOrderValue}>{otherReferences || 'scf'}</Text>
          </View>
          <View style={styles.reviewOrderRow}>
            <Text style={styles.reviewOrderLabel}>Delivery Note Date</Text>
            <Text style={styles.reviewOrderValue}>{deliveryDate || 'Same Day'}</Text>
          </View>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.reviewTable}>
        <View style={styles.reviewTableHeader}>
          <Text style={[styles.reviewTableCell, { width: '8%' }]}>SI. No</Text>
          <Text style={[styles.reviewTableCell, { width: '32%' }]}>Description</Text>
          <Text style={[styles.reviewTableCell, { width: '12%' }]}>Quantity</Text>
          <Text style={[styles.reviewTableCell, { width: '12%' }]}>Unit</Text>
          <Text style={[styles.reviewTableCell, { width: '12%' }]}>Rate</Text>
          <Text style={[styles.reviewTableCell, { width: '12%' }]}>Per</Text>
          <Text style={[styles.reviewTableCell, { width: '12%' }]}>Amount</Text>
        </View>
        {items.filter(i => i.description).map((item, index) => (
          <View key={index} style={styles.reviewTableRow}>
            <Text style={[styles.reviewTableCell, { width: '8%' }]}>{index + 1}</Text>
            <Text style={[styles.reviewTableCell, { width: '32%' }]}>{item.description || 'ce'}</Text>
            <Text style={[styles.reviewTableCell, { width: '12%' }]}>{item.qty || 1}</Text>
            <Text style={[styles.reviewTableCell, { width: '12%' }]}>{item.unit || 'Nos'}</Text>
            <Text style={[styles.reviewTableCell, { width: '12%' }]}>₹{item.rate || 78.00}</Text>
            <Text style={[styles.reviewTableCell, { width: '12%' }]}>{item.days || 1} Days</Text>
            <Text style={[styles.reviewTableCell, { width: '12%' }]}>₹{item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Amount in Words and Total */}
      <View style={styles.reviewAmountSection}>
        <View style={styles.reviewAmountLeft}>
          <Text style={styles.reviewAmountLabel}>Amount Chargeable (in Words):</Text>
          <Text style={styles.reviewAmountWords}>Rupees {numberToWords(totals.subtotal)} only</Text>
        </View>
        <View style={styles.reviewAmountRight}>
          <View style={styles.reviewTotalRow}>
            <Text style={styles.reviewTotalLabel}>Total A</Text>
            <Text style={styles.reviewTotalValue}>₹{totals.subtotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Tax Table */}
      <View style={styles.reviewTaxTable}>
        <View style={styles.reviewTaxHeader}>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>HSN/SAC</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>Taxable Value</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>Central Tax</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>State Tax</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>Total Tax Amount</Text>
        </View>
        <View style={styles.reviewTaxRow}>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>{hsnCode}</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>₹{totals.subtotal.toFixed(2)}</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>9% - ₹{totals.cgst.toFixed(2)}</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>9% - ₹{totals.sgst.toFixed(2)}</Text>
          <Text style={[styles.reviewTaxCell, { width: '20%' }]}>₹{(totals.cgst + totals.sgst).toFixed(2)}</Text>
        </View>
      </View>

      {/* Tax Amount in Words */}
      <View style={styles.reviewTaxWords}>
        <Text style={styles.reviewTaxWordsLabel}>Tax Amount (in Words): INR</Text>
        <Text style={styles.reviewTaxWordsText}>Rupees {numberToWords(totals.cgst + totals.sgst)} only</Text>
      </View>

      {/* Grand Total */}
      <View style={styles.reviewGrandTotal}>
        <Text style={styles.reviewGrandTotalLabel}>Total</Text>
        <Text style={styles.reviewGrandTotalValue}>₹{totals.grandTotal.toFixed(2)}</Text>
      </View>

      {/* Bank Details */}
      <View style={styles.reviewBankSection}>
        <Text style={styles.reviewBankTitle}>Company's Bank Details</Text>
        <Text style={styles.reviewBankText}>A/C Holder Name: STATE BANK OF INDIA</Text>
        <Text style={styles.reviewBankText}>For Vibrant Eventz Solution</Text>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsSection}>
        <Text style={styles.termsTitle}>Terms and Conditions:</Text>
        <Text style={styles.termsText}>
          We declare that this invoice shows the actual price of the Materials described and that all particulars are true and correct.
        </Text>
      </View>

      {/* Computer Generated */}
      <View style={styles.computerGenerated}>
        <Text style={styles.computerGeneratedText}>This is a Computer Generated Invoice</Text>
      </View>

      <View style={{ height: 8 }}></View>
      </View>
    </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {currentStep !== 5 && (
        <View style={styles.header} className="header">
          <TouchableOpacity onPress={() => navigation.goBack()} className="back-button">
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Bill</Text>
          <View style={{ width: 60 }}></View>
        </View>
      )}

      {currentStep !== 5 && (
        <View className="stepIndicator">
          {renderStepIndicator()}
        </View>
      )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          responsive.isDesktop && { 
            maxWidth: responsive.containerMaxWidth,
            alignSelf: 'center',
            width: '100%',
          }
        ]}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        <View style={{ height: 20 }}></View>
      </ScrollView>

      {currentStep !== 5 && (
        <View style={styles.navigationButtons} className="navigationButtons">
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {currentStep === 5 && (
        <View style={styles.navigationButtons} className="navigationButtons" nativeID="submit-button-container">
          <TouchableOpacity style={styles.submitButton} onPress={saveBill}>
            <Text style={styles.submitButtonText}>Submit & Create Invoice</Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    width: '100%',
    maxWidth: '100%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  removeButton: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addItemButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  itemCardNew: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitleNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  removeButtonNew: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '400',
  },
  textAreaNew: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  itemAmountBox: {
    backgroundColor: '#ecfeff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  itemAmountLabel: {
    fontSize: 13,
    color: '#0e7490',
    fontWeight: '600',
    flexShrink: 1,
  },
  itemAmountFormula: {
    fontSize: 11,
    color: '#0891b2',
    marginTop: 2,
    flexShrink: 1,
  },
  itemAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0e7490',
    flexShrink: 0,
    textAlign: 'right',
    minWidth: 120,
  },
  subtotalBox: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 12,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
    flexShrink: 1,
  },
  subtotalNote: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
    flexShrink: 1,
  },
  subtotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#065f46',
    flexShrink: 0,
    textAlign: 'right',
    minWidth: 140,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  smallInput: {
    flex: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  grandTotalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#cbd5e1',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  saveButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#0ea5e9',
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#e2e8f0',
    width: 20,
    marginTop: -20,
  },
  stepLineCompleted: {
    backgroundColor: '#10b981',
  },
  stepContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 8,
  },
  tipBox: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  smallInputContainer: {
    flex: 1,
  },
  threeColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  threeColumnItem: {
    flex: 1,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  twoColumnItem: {
    flex: 1,
    minWidth: 140,
    maxWidth: '100%',
  },
  noteBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  noteBold: {
    fontWeight: 'bold',
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#1e293b',
  },
  reviewSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 20,
  },
  reviewItem: {
    marginBottom: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  pdfContentWrapper: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 4,
  },
  reviewLogoSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewLogo: {
    width: 50,
    height: 50,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  reviewCompanyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    letterSpacing: 0.5,
  },
  reviewTagline: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  reviewInvoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  reviewInvoiceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reviewOriginal: {
    fontSize: 12,
    color: '#64748b',
  },
  reviewInfoGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  reviewInfoLeft: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  reviewInfoRight: {
    width: '40%',
    padding: 12,
  },
  reviewInfoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewInfoText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
    lineHeight: 14,
  },
  reviewInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewInfoLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  reviewInfoValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewBuyerSection: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    marginBottom: 10,
  },
  reviewBuyerName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewBuyerText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
    lineHeight: 14,
  },
  reviewOrderGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  reviewOrderLeft: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  reviewOrderRight: {
    flex: 1,
    padding: 12,
  },
  reviewOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewOrderLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  reviewOrderValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewTable: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  reviewTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  reviewTableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewTableCell: {
    fontSize: 9,
    color: '#1e293b',
    textAlign: 'center',
  },
  reviewAmountSection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  reviewAmountLeft: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  reviewAmountRight: {
    width: '30%',
    padding: 12,
    justifyContent: 'center',
  },
  reviewAmountLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewAmountWords: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: '600',
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  reviewTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  reviewTaxTable: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  reviewTaxHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  reviewTaxRow: {
    flexDirection: 'row',
    padding: 8,
  },
  reviewTaxCell: {
    fontSize: 9,
    color: '#1e293b',
    textAlign: 'center',
  },
  reviewTaxWords: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    marginBottom: 10,
  },
  reviewTaxWordsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewTaxWordsText: {
    fontSize: 10,
    color: '#1e293b',
  },
  reviewGrandTotal: {
    backgroundColor: '#dcfce7',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 4,
  },
  reviewGrandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065f46',
  },
  reviewGrandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  reviewBankSection: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    marginBottom: 10,
  },
  reviewBankTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewBankText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
    lineHeight: 14,
  },
  reviewWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  reviewHeader: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewBackButton: {
    padding: 8,
  },
  reviewBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtonsContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  pdfButton: {
    backgroundColor: '#a855f7',
  },
  emailButton: {
    backgroundColor: '#ef4444',
  },
  whatsappButton: {
    backgroundColor: '#10b981',
  },
  printButton: {
    backgroundColor: '#06b6d4',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  termsSection: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    marginBottom: 10,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1e293b',
  },
  termsText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 14,
  },
  computerGenerated: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  computerGeneratedText: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
