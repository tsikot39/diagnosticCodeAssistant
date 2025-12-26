import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { colors } = useTheme();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const categoryData = stats?.categories ? Object.entries(stats.categories) : [];
  const severityData = stats?.severity_breakdown ? Object.entries(stats.severity_breakdown) : [];

  const severityColors: Record<string, string> = {
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
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats?.total_codes || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Codes
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {stats?.active_codes || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Codes
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Categories
        </Text>
        {categoryData.map(([category, count]) => (
          <View key={category} style={styles.listItem}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>{category}</Text>
            <Text style={[styles.itemValue, { color: colors.primary }]}>{count}</Text>
          </View>
        ))}
        {categoryData.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No data available
          </Text>
        )}
      </View>

      {/* Severity Breakdown */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Severity Distribution
        </Text>
        {severityData.map(([severity, count]) => (
          <View key={severity} style={styles.listItem}>
            <View style={styles.severityRow}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: severityColors[severity.toLowerCase()] || colors.textSecondary },
                ]}
              />
              <Text style={[styles.itemLabel, { color: colors.text }]}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Text>
            </View>
            <Text style={[styles.itemValue, { color: colors.primary }]}>{count}</Text>
          </View>
        ))}
        {severityData.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No data available
          </Text>
        )}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
