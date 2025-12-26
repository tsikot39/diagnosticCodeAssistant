# Diagnostic Code Assistant - Mobile App

📱 **React Native + Expo** mobile version of the Diagnostic Code Assistant

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Backend API running** (see main README)

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your machine's IP address (not localhost!)
# Find your IP:
# Windows: ipconfig
# Mac/Linux: ifconfig
# Example: API_URL=http://192.168.1.100:8000
```

### Running the App

```bash
# Start Expo dev server
npm start

# Or start with specific platform
npm run android   # Open on Android device/emulator
npm run ios       # Open on iOS device/simulator
npm run web       # Open in web browser
```

### Testing on Your Phone

1. **Install Expo Go** from App Store or Play Store
2. **Run** `npm start` in the mobile directory
3. **Scan QR code**:
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app scanner
4. **Login** with demo credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

---

## 📱 Features

### ✅ Implemented

- **Authentication**
  - Secure login with JWT tokens
  - Token storage with Expo SecureStore
  - Auto-login on app restart
  - Logout functionality

- **Code Management**
  - Browse all diagnostic codes
  - Search with real-time filtering
  - Filter by category
  - View code details
  - Pull-to-refresh

- **Favorites**
  - Add codes to favorites
  - View favorite codes
  - Remove from favorites

- **Dashboard**
  - Total code statistics
  - Category breakdown
  - Severity distribution
  - Visual data display

- **Settings**
  - Theme switcher (Light/Dark/System)
  - User account info
  - App version info
  - Logout

- **UI/UX**
  - Dark mode support
  - Theme persistence
  - Bottom tab navigation
  - Smooth animations
  - Loading states
  - Error handling
  - Pull-to-refresh

---

## 📁 Project Structure

```
mobile/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home (code listing)
│   │   ├── favorites.tsx    # Favorites screen
│   │   ├── dashboard.tsx    # Analytics dashboard
│   │   └── settings.tsx     # Settings & logout
│   ├── code/
│   │   └── [id].tsx         # Code detail screen
│   ├── _layout.tsx          # Root layout (providers)
│   ├── index.tsx            # App entry point
│   └── login.tsx            # Login screen
├── context/                 # React contexts
│   ├── AuthContext.tsx      # Authentication state
│   └── ThemeContext.tsx     # Theme management
├── services/                # API services
│   └── api.ts              # Axios API client
├── types/                   # TypeScript types
│   └── index.ts            # Shared type definitions
├── app.json                 # Expo configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

---

## 🎨 Tech Stack

### Core

- **React Native 0.73** - Mobile framework
- **Expo SDK 50** - Development platform
- **TypeScript** - Type safety
- **Expo Router 3** - File-based routing

### State & Data

- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Zod** - Schema validation

### Storage

- **Expo SecureStore** - Secure token storage
- **AsyncStorage** - Theme preferences

### UI & Navigation

- **React Navigation** - Navigation library
- **React Native Gesture Handler** - Touch gestures
- **React Native Reanimated** - Smooth animations
- **SafeAreaContext** - Safe area handling

---

## 🔐 Authentication

The app uses **JWT token authentication** with secure storage:

1. User logs in with email/password
2. Backend returns JWT access token
3. Token stored in **Expo SecureStore** (encrypted)
4. Token automatically added to API requests
5. Token persists across app restarts
6. Auto-logout on 401 responses

---

## 🎨 Theming

The app supports **three theme modes**:

- **Light**: Light color scheme
- **Dark**: Dark color scheme  
- **System**: Follows device settings

Theme preference is saved to AsyncStorage and persists across app restarts.

---

## 📱 Screens Overview

### 1. Login Screen (`/login`)
- Email/password authentication
- Demo credentials displayed
- Loading states
- Error handling

### 2. Home Screen (`/(tabs)/index`)
- Diagnostic code listing
- Search functionality
- Category filtering
- Pull-to-refresh
- Floating action button (add new)

### 3. Code Detail Screen (`/code/[id]`)
- Full code information
- Resolution steps
- Related codes
- Add to favorites
- Delete code

### 4. Favorites Screen (`/(tabs)/favorites`)
- Saved favorite codes
- Notes display
- Quick navigation to details
- Pull-to-refresh

### 5. Dashboard Screen (`/(tabs)/dashboard`)
- Statistics cards
- Category breakdown
- Severity distribution
- Visual data presentation

### 6. Settings Screen (`/(tabs)/settings`)
- User account info
- Theme selector
- App version
- Logout button

---

## 🔌 API Integration

All API calls go through the centralized **API Service** (`services/api.ts`):

```typescript
// Example usage
import apiService from '@/services/api';

// Get codes with filters
const codes = await apiService.getCodes({
  query: 'network',
  category: 'Network',
  per_page: 50
});

// Get code by ID
const code = await apiService.getCodeById(123);

// Add to favorites
await apiService.addFavorite(codeId, 'Important note');
```

---

## 🛠️ Development

### Environment Variables

Create `.env` file (copy from `.env.example`):

```env
# IMPORTANT: Use your machine's IP address, NOT localhost!
# Localhost won't work on physical devices

API_URL=http://192.168.1.100:8000

# Find your IP:
# Windows: ipconfig
# Mac: ifconfig | grep "inet "
# Linux: ip addr show
```

### Running on Device vs Simulator

**Physical Device** (Recommended):
- Better performance
- Real touch experience
- True device testing
- Requires IP address in `.env`

**iOS Simulator**:
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

### Hot Reload

Expo supports **Fast Refresh**:
- Save any file
- Changes appear instantly
- State is preserved (usually)
- Shake device to open dev menu

---

## 📦 Building for Production

### Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

### App Store Deployment

**iOS (App Store)**:
1. Build with `eas build --platform ios`
2. Download IPA file
3. Upload to App Store Connect
4. Submit for review

**Android (Play Store)**:
1. Build with `eas build --platform android`
2. Download APK/AAB file
3. Upload to Google Play Console
4. Submit for review

---

## 🐛 Troubleshooting

### "Network request failed"

**Problem**: Can't connect to backend API

**Solution**:
1. Check backend is running (`http://localhost:8000`)
2. Use your machine's IP, not `localhost` in `.env`
3. Ensure phone and computer are on same WiFi
4. Check firewall settings

### "Unable to resolve module"

**Problem**: Missing dependencies

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### QR code not scanning

**Problem**: Can't scan QR code with Expo Go

**Solution**:
- **iOS**: Use Camera app (not Expo Go) to scan
- **Android**: Use Expo Go's built-in scanner
- Alternatively, press `i` (iOS) or `a` (Android) in terminal

### Token expired errors

**Problem**: Getting 401 errors after some time

**Solution**: Backend token expiration is working correctly. Just login again.

---

## 🚀 Future Features

### Planned Additions

- [ ] **Biometric authentication** (Face ID / Touch ID)
- [ ] **Offline mode** with local database
- [ ] **Push notifications** for important updates
- [ ] **QR code scanner** for quick code lookup
- [ ] **Share codes** via message/email
- [ ] **Create/Edit codes** from mobile
- [ ] **Bulk operations**
- [ ] **Advanced search filters**
- [ ] **Code history tracking**
- [ ] **Organization switching**

---

## 📄 License

Same as main project - see root LICENSE file

---

## 🤝 Contributing

1. Make changes in the mobile directory
2. Test on both iOS and Android
3. Test on both light and dark themes
4. Ensure types are correct
5. Submit PR

---

## 📞 Support

- **Issues**: GitHub Issues
- **Questions**: GitHub Discussions
- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev

---

**Built with ❤️ using React Native + Expo**
