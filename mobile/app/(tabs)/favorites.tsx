import React from 'react';
import {
  View,
  Text,
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
import { Favorite } from '../../types';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { data: favorites, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiService.getFavorites(),
  });

  const renderFavoriteItem = ({ item }: { item: Favorite }) => {
    const severityColors = {
      low: colors.success,
      medium: colors.warning,
      high: colors.error,
      critical: colors.critical,
    };

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/code/${item.code_id}`)}
      >
        <View style={styles.header}>
          <Text style={[styles.code, { color: colors.primary }]}>
            {item.code?.code}
          </Text>
          {item.code?.severity && (
            <View style={[styles.badge, { backgroundColor: severityColors[item.code.severity] }]}>
              <Text style={styles.badgeText}>{item.code.severity.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
          {item.code?.description}
        </Text>
        {item.notes && (
          <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={1}>
            Note: {item.notes}
          </Text>
        )}
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {item.code?.category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={favorites || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavoriteItem}
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
                No favorites yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Star codes to save them here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  notes: {
    fontSize: 13,
    marginBottom: 8,
    fontStyle: 'italic',
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
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
