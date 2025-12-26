import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

export default function CodeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: code, isLoading } = useQuery({
    queryKey: ['code', id],
    queryFn: () => apiService.getCodeById(Number(id)),
    enabled: !!id && id !== 'new',
  });

  const deleteMutation = useMutation({
    mutationFn: (codeId: number) => apiService.deleteCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      Alert.alert('Success', 'Code deleted successfully');
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete code');
    },
  });

  const favoritesMutation = useMutation({
    mutationFn: (codeId: number) => apiService.addFavorite(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      Alert.alert('Success', 'Added to favorites');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add to favorites');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Code',
      'Are you sure you want to delete this code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(Number(id)),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!code) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Code not found
        </Text>
      </View>
    );
  }

  const severityColors = {
    low: colors.success,
    medium: colors.warning,
    high: colors.error,
    critical: colors.critical,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.code, { color: colors.primary }]}>{code.code}</Text>
          <View style={[styles.badge, { backgroundColor: severityColors[code.severity] }]}>
            <Text style={styles.badgeText}>{code.severity.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {code.category}
        </Text>
      </View>

      {/* Description */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text style={[styles.text, { color: colors.text }]}>{code.description}</Text>
      </View>

      {/* Resolution Steps */}
      {code.resolution_steps && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Resolution Steps
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {code.resolution_steps}
          </Text>
        </View>
      )}

      {/* Related Codes */}
      {code.related_codes && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Related Codes
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {code.related_codes}
          </Text>
        </View>
      )}

      {/* Status */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
        <Text style={[styles.text, { color: code.is_active ? colors.success : colors.error }]}>
          {code.is_active ? 'Active' : 'Inactive'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => favoritesMutation.mutate(code.id)}
          disabled={favoritesMutation.isPending}
        >
          <Text style={styles.buttonText}>Add to Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
  },
});
