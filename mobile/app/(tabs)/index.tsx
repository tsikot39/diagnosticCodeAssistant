import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import { DiagnosticCode } from '../../types';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { colors } = useTheme();
  const router = useRouter();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['codes', searchQuery, selectedCategory],
    queryFn: () => apiService.getCodes({
      query: searchQuery || undefined,
      category: selectedCategory || undefined,
      per_page: 50,
    }),
  });

  const categories = ['Network', 'Hardware', 'Software', 'Database', 'Security', 'Performance'];

  const renderCodeItem = ({ item }: { item: DiagnosticCode }) => {
    const severityColors = {
      low: colors.success,
      medium: colors.warning,
      high: colors.error,
      critical: colors.critical,
    };

    return (
      <TouchableOpacity
        style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/code/${item.id}`)}
      >
        <View style={styles.codeHeader}>
          <Text style={[styles.codeText, { color: colors.primary }]}>{item.code}</Text>
          <View style={[styles.severityBadge, { backgroundColor: severityColors[item.severity] }]}>
            <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Search codes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(selectedCategory === item ? '' : item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === item ? '#FFFFFF' : colors.text },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Code List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCodeItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No codes found
              </Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/code/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  codeCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
