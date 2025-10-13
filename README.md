# Bill Event App - Event Management Billing Application

A complete React Native billing application for event management with login, dashboard, and professional invoice generation.

## Features

- 🔐 **Admin Login** - Secure authentication for admin access
- 📊 **Dashboard** - Overview of all bills and revenue statistics
- 📝 **Create Bills** - Easy-to-use form for creating new invoices
- 🧾 **Professional Invoices** - Generate invoices matching your template design
- 💾 **Local Storage** - All data stored locally using AsyncStorage
- 📱 **Responsive Design** - Works on all screen sizes

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tooling
- **React Navigation** - Navigation between screens
- **NativeWind** - Tailwind CSS for React Native
- **AsyncStorage** - Local data persistence

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Run on your device:**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Or scan the QR code with Expo Go app

## Usage

### Login Credentials
- **Username:** admin
- **Password:** admin123

### Creating a Bill

1. Login with admin credentials
2. Click "Create New Bill" on the dashboard
3. Fill in the invoice details:
   - Invoice number
   - Client information
   - Event details
   - Add items with quantity, rate, and days
4. Review the calculated totals (including GST)
5. Click "Save Bill"

### Viewing Bills

1. All created bills appear on the dashboard
2. Click "View" on any bill to see the detailed invoice
3. The invoice matches your professional template design
4. Click "Delete" to remove a bill

## Project Structure

```
bill-event-app/
├── App.js                          # Main app entry with navigation
├── src/
│   └── screens/
│       ├── LoginScreen.js          # Admin login page
│       ├── DashboardScreen.js      # Dashboard with bill list
│       ├── CreateBillScreen.js     # Form to create new bills
│       └── BillingScreen.js        # Professional invoice view
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel configuration
└── tailwind.config.js              # Tailwind CSS configuration
```

## Features Breakdown

### Login Screen
- Clean, modern UI
- Form validation
- Demo credentials displayed
- Secure password input

### Dashboard
- Total bills count
- Total revenue calculation
- Recent bills list
- Quick actions (View/Delete)
- Logout functionality

### Create Bill Screen
- Invoice details section
- Client information form
- Event details
- Dynamic item list (add/remove items)
- Auto-calculation of amounts
- GST calculation (CGST 9% + SGST 9%)
- Round-off handling
- Amount in words conversion

### Billing/Invoice Screen
- Professional invoice layout
- Company branding
- Complete client details
- Itemized billing table
- Tax breakdown (CGST/SGST)
- HSN/SAC details
- Amount in words (Indian numbering system)
- Terms and conditions
- Signature section
- Contact information footer

## Customization

### Update Company Details

Edit `BillingScreen.js` to update:
- Company name and logo
- Address
- GST number
- Bank details
- Contact information

### Modify Tax Rates

In `CreateBillScreen.js`, update the `calculateTotals` function:
```javascript
const cgst = subtotal * 0.09; // Change 0.09 to your CGST rate
const sgst = subtotal * 0.09; // Change 0.09 to your SGST rate
```

### Change Login Credentials

In `LoginScreen.js`, modify the validation:
```javascript
if (username === 'admin' && password === 'admin123') {
  // Change credentials here
}
```

## Data Storage

- All bills are stored locally using AsyncStorage
- Data persists between app sessions
- No internet connection required
- Data is stored in JSON format

## Future Enhancements

- PDF export functionality
- Email invoice feature
- Multiple user accounts
- Advanced search and filters
- Payment tracking
- Client management
- Reports and analytics
- Cloud backup

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Navigation issues
```bash
# Reinstall navigation packages
npm install @react-navigation/native @react-navigation/stack
```

### AsyncStorage errors
```bash
# Reinstall AsyncStorage
npm install @react-native-async-storage/async-storage
```

## Support

For issues or questions, please contact:
- Email: info@vibranteventzsolution@gmail.com
- Phone: +91-9360XXXXX1

## License

This project is created for Vibrant Eventz Solution.

---

**Built with ❤️ for Event Management**
