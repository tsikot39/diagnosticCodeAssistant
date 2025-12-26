import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme, actualTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const themeOptions = [
    { label: 'Light', value: 'light' as const },
    { label: 'Dark', value: 'dark' as const },
    { label: 'System', value: 'system' as const },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* User Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Account
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
          <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
        </View>
        {user?.full_name && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user.full_name}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Role</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {user?.is_superuser ? 'Admin' : 'User'}
          </Text>
        </View>
      </View>

      {/* Theme Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        <View style={styles.themeContainer}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeButton,
                {
                  backgroundColor: theme === option.value ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setTheme(option.value)}
            >
              <Text
                style={[
                  styles.themeText,
                  { color: theme === option.value ? '#FFFFFF' : colors.text },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Current: {actualTheme === 'dark' ? 'Dark' : 'Light'}
        </Text>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Version</Text>
          <Text style={[styles.value, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>App Name</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            Diagnostic Code Assistant
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    marginTop: 8,
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
