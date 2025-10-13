import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function BillingScreen({ navigation, route }) {
  const { bill } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={{ width: 60 }}></View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.invoice}>
          {/* Logo and Header */}
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>VIBRANT EVENTZ SOLUTION</Text>
            <Text style={styles.tagline}>EVERYTHING IS COMPLETE</Text>
            <View style={styles.divider} />
          </View>

          {/* Tax Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceLeft}>
              <Text style={styles.companyName}>Vibrant Eventz Solution</Text>
              <Text style={styles.address}>
                D/O VELMURUGAN ALLAGARAMPALAYAM{'\n'}
                THUDUPATHI POST PALLADAM{'\n'}
                CHENNAI - 600001
              </Text>
              <Text style={styles.contactInfo}>
                GST No: 33XXXXXX1234{'\n'}
                Contact: +91 9876543210
              </Text>
              <Text style={styles.bankDetails}>
                STATE BANK OF INDIA{'\n'}
                231 NGO Colony A{'\n'}
                Tirupur - 641604{'\n'}
                GSTIN/UIN: 33AAXXXXX7XXZW{'\n'}
                Telephone: 9360XXXXX91
              </Text>
            </View>
            <View style={styles.invoiceRight}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Invoice</Text>
                <Text style={styles.value}>{bill.invoiceNo}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Delivery Date</Text>
                <Text style={styles.value}>{bill.deliveryDate || 'Same Day'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Mode/Terms of Payment</Text>
                <Text style={styles.value}>{bill.paymentMode || 'Cash'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{bill.date}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Supplier's Ref</Text>
                <Text style={styles.value}>{bill.supplierRef || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Other Reference(s)</Text>
                <Text style={styles.value}>{bill.otherReferences || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Buyer's Order No</Text>
                <Text style={styles.value}>{bill.buyerOrderNo || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Dated</Text>
                <Text style={styles.value}>{bill.orderDate || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Despatch Document No</Text>
                <Text style={styles.value}>{bill.dispatchDocNo || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Delivery Note Date</Text>
                <Text style={styles.value}>{bill.deliveryDate || 'Same Date'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Despatched through</Text>
                <Text style={styles.value}>{bill.dispatchedThrough || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Destination</Text>
                <Text style={styles.value}>{bill.destination || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Payment/Delivery</Text>
                <Text style={styles.value}>-</Text>
              </View>
            </View>
          </View>

          {/* Buyer Details */}
          <View style={styles.buyerSection}>
            <Text style={styles.buyerLabel}>Buyer (Bill to)</Text>
            <Text style={styles.buyerName}>{bill.clientName}</Text>
            <Text style={styles.buyerAddress}>{bill.clientAddress}</Text>
            <Text style={styles.buyerGSTIN}>GSTIN/UIN: {bill.clientGSTIN || 'N/A'}</Text>
            {bill.clientState && (
              <Text style={styles.buyerContact}>State: {bill.clientState} - Code: {bill.clientStateCode || 'N/A'}</Text>
            )}
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.slNo]}>Sl No</Text>
              <Text style={[styles.tableCell, styles.description]}>Description</Text>
              <Text style={[styles.tableCell, styles.qty]}>Qty</Text>
              <Text style={[styles.tableCell, styles.rate]}>Rate</Text>
              <Text style={[styles.tableCell, styles.days]}>Days</Text>
              <Text style={[styles.tableCell, styles.amount]}>Amount</Text>
            </View>

            {bill.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.slNo]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.description]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.qty]}>{item.qty}</Text>
                <Text style={[styles.tableCell, styles.rate]}>{item.rate}</Text>
                <Text style={[styles.tableCell, styles.days]}>{item.days || 1}</Text>
                <Text style={[styles.tableCell, styles.amount]}>₹{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>Total A</Text>
              <Text style={styles.totalAmount}>₹{bill.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}></Text>
              <Text style={styles.totalValue}>CGST</Text>
              <Text style={styles.totalAmount}>9%</Text>
              <Text style={styles.totalAmount}>₹{bill.cgst.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}></Text>
              <Text style={styles.totalValue}>SGST</Text>
              <Text style={styles.totalAmount}>9%</Text>
              <Text style={styles.totalAmount}>₹{bill.sgst.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}></Text>
              <Text style={styles.totalValue}>Round Off</Text>
              <Text style={styles.totalAmount}>₹{bill.roundOff.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalAmount}>₹{bill.grandTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* HSN/SAC Table */}
          <View style={styles.hsnSection}>
            <Text style={styles.hsnTitle}>Amount Chargeable (in Words):</Text>
            <Text style={styles.amountWords}>
              {numberToWords(bill.grandTotal)} Rupees Only
            </Text>
            
            <View style={styles.hsnTable}>
              <View style={styles.hsnHeader}>
                <Text style={styles.hsnCell}>HSN/SAC</Text>
                <Text style={styles.hsnCell}>Taxable Value</Text>
                <Text style={styles.hsnCell}>Central Tax</Text>
                <Text style={styles.hsnCell}>State Tax</Text>
                <Text style={styles.hsnCell}>Total Tax Amount</Text>
              </View>
              <View style={styles.hsnRow}>
                <Text style={styles.hsnCell}>998599</Text>
                <Text style={styles.hsnCell}>₹{bill.subtotal.toFixed(2)}</Text>
                <Text style={styles.hsnCell}>9% - ₹{bill.cgst.toFixed(2)}</Text>
                <Text style={styles.hsnCell}>9% - ₹{bill.sgst.toFixed(2)}</Text>
                <Text style={styles.hsnCell}>₹{(bill.cgst + bill.sgst).toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.taxNote}>
              Tax Amount (in Words): {numberToWords(Math.round(bill.cgst + bill.sgst))} Rupees Only
            </Text>
            <Text style={styles.note}>
              Rupees Note (Required for Rounded and Security Day Buyer only)
            </Text>
          </View>

          {/* Terms and Signature */}
          <View style={styles.footer}>
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>Terms and Conditions:</Text>
              <Text style={styles.termsText}>
                We declare that this invoice shows the actual price of the{'\n'}
                Materials described and that all particulars are true and correct.
              </Text>
            </View>
            <View style={styles.signatureSection}>
              <Text style={styles.signatureTitle}>For Vibrant Eventz Solution</Text>
              <View style={styles.signatureSpace} />
              <Text style={styles.signatureText}>Authorized Signatory</Text>
            </View>
          </View>

          {/* Company Footer */}
          <View style={styles.companyFooter}>
            <Text style={styles.footerText}>This is a Computer generated Invoice</Text>
          </View>

          {/* Contact Footer */}
          <View style={styles.contactFooter}>
            <Text style={styles.contactItem}>📍 Old No. 28, New No. 40, Ground Floor, Bharathiyar 1st Street</Text>
            <Text style={styles.contactItem}>📞 +91-9360XXXXX1</Text>
            <Text style={styles.contactItem}>✉️ info@vibranteventzsolution@gmail.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper function to convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  
  let words = '';
  
  if (num >= 10000000) {
    words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  
  if (num >= 100000) {
    words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  if (num >= 1000) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    words += teens[num - 10] + ' ';
    return words.trim();
  }
  
  if (num > 0) {
    words += ones[num] + ' ';
  }
  
  return words.trim();
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
  invoice: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#0ea5e9',
    marginTop: 8,
  },
  invoiceHeader: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  invoiceLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  invoiceRight: {
    width: '45%',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 9,
    marginBottom: 6,
    lineHeight: 12,
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 6,
    lineHeight: 12,
  },
  bankDetails: {
    fontSize: 9,
    lineHeight: 12,
  },
  infoBox: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 4,
  },
  label: {
    fontSize: 8,
    flex: 1,
    color: '#000',
  },
  value: {
    fontSize: 8,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  buyerSection: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginBottom: 10,
  },
  buyerLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  buyerAddress: {
    fontSize: 9,
    marginBottom: 2,
  },
  buyerGSTIN: {
    fontSize: 9,
    marginBottom: 2,
  },
  buyerContact: {
    fontSize: 9,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 4,
    minHeight: 25,
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
  },
  slNo: {
    width: '8%',
  },
  description: {
    width: '40%',
    textAlign: 'left',
  },
  qty: {
    width: '10%',
  },
  rate: {
    width: '15%',
  },
  days: {
    width: '10%',
  },
  amount: {
    width: '17%',
    textAlign: 'right',
  },
  totalsSection: {
    borderWidth: 1,
    borderColor: '#000',
    borderTopWidth: 0,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  totalLabel: {
    fontSize: 9,
    flex: 1,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 9,
    flex: 1,
  },
  totalAmount: {
    fontSize: 9,
    width: '20%',
    textAlign: 'right',
  },
  grandTotalRow: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  grandTotalAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    width: '30%',
    textAlign: 'right',
  },
  hsnSection: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginBottom: 10,
  },
  hsnTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountWords: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hsnTable: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 8,
  },
  hsnHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 4,
  },
  hsnRow: {
    flexDirection: 'row',
    padding: 4,
  },
  hsnCell: {
    fontSize: 8,
    flex: 1,
    textAlign: 'center',
  },
  taxNote: {
    fontSize: 9,
    marginBottom: 4,
  },
  note: {
    fontSize: 8,
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  termsSection: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  termsText: {
    fontSize: 8,
    lineHeight: 12,
  },
  signatureSection: {
    width: '40%',
    padding: 8,
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  signatureSpace: {
    height: 40,
  },
  signatureText: {
    fontSize: 9,
    marginTop: 4,
  },
  companyFooter: {
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
  },
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#f1f5f9',
  },
  contactItem: {
    fontSize: 7,
    color: '#64748b',
  },
});
