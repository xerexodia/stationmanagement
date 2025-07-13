import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ChargingHistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Sample data for different charging session states
  const chargingSessions = {
    upcoming: [
      {
        id: '1',
        date: '19 FEB 2024',
        time: '08:00 AM',
        stationName: 'Name of the station',
        address: '685-02 street josef russ, sahloul 2 Tunis',
        type: 'AC/DC',
        power: '1000 kWh',
        duration: '2 hours',
        price: '22 TND',
        status: 'upcoming',
        remindMe: true,
      },
    ],
    completed: [
      {
        id: '2',
        date: '19 FEB 2024',
        time: '08:00 AM',
        stationName: 'Name of the station',
        address: '685-02 street josef russ, sahloul 2 Tunis',
        type: 'AC/DC',
        power: '1000 kWh',
        duration: '2 hours',
        price: '22 TND',
        status: 'completed',
      },
      {
        id: '3',
        date: '19 FEB 2024',
        time: '08:00 AM',
        stationName: 'Name of the station',
        address: '685-02 street josef russ, sahloul 2 Tunis',
        type: 'AC/DC',
        power: '1000 kWh',
        duration: '2 hours',
        price: '22 TND',
        status: 'completed',
      },
    ],
    canceled: [
      {
        id: '4',
        date: '19 FEB 2024',
        time: '08:00 AM',
        stationName: 'Name of the station',
        address: '685-02 street josef russ, sahloul 2 Tunis',
        type: 'AC/DC',
        power: '1000 kWh',
        duration: '2 hours',
        price: '22 TND',
        status: 'canceled',
      },
    ],
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: 'refresh-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-outline' },
    { key: 'canceled', label: 'Canceled', icon: 'close-outline' },
  ];

  const getTabStyle = (tabKey) => {
    const isActive = activeTab === tabKey;
    let backgroundColor = '#F5F5F5';
    let textColor = '#666';
    
    if (isActive) {
      switch (tabKey) {
        case 'upcoming':
          backgroundColor = '#FFC107';
          textColor = '#fff';
          break;
        case 'completed':
          backgroundColor = '#4CAF50';
          textColor = '#fff';
          break;
        case 'canceled':
          backgroundColor = '#F44336';
          textColor = '#fff';
          break;
      }
    }
    
    return { backgroundColor, textColor };
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'upcoming':
        return { backgroundColor: '#FFF3CD', color: '#856404', text: 'Upcoming' };
      case 'completed':
        return { backgroundColor: '#D4EDDA', color: '#155724', text: 'Completed' };
      case 'canceled':
        return { backgroundColor: '#F8D7DA', color: '#721C24', text: 'Canceled' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#666', text: status };
    }
  };

  const renderSessionCard = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    
    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sessionDate}>{item.date}</Text>
            <Text style={styles.sessionTime}>{item.time}</Text>
          </View>
          <View style={styles.statusContainer}>
            {item.status === 'upcoming' && item.remindMe && (
              <View style={styles.remindMeContainer}>
                <Text style={styles.remindMeText}>Remind me</Text>
                <View style={styles.toggleOn}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusStyle.text}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{item.stationName}</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#4CAF50" />
            <Text style={styles.addressText}>{item.address}</Text>
          </View>
          <TouchableOpacity style={styles.directionButton}>
            <Ionicons name="paper-plane" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="flash" size={16} color="#666" />
            <Text style={styles.detailLabel}>{item.type}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Power</Text>
            <Text style={styles.detailValue}>{item.power}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{item.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>{item.price}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {item.status === 'upcoming' && (
            <>
              <TouchableOpacity style={styles.cancelButton}>
                <Ionicons name="close" size={16} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsButtonText}>View details</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'completed' && (
            <>
              <TouchableOpacity style={styles.viewDetailsButtonOutline}>
                <Text style={styles.viewDetailsButtonOutlineText}>View details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookAgainButton}>
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.bookAgainButtonText}>Book again</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'canceled' && (
            <TouchableOpacity style={styles.viewDetailsButtonOutline}>
              <Text style={styles.viewDetailsButtonOutlineText}>View details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back() }
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Charging History</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const tabStyle = getTabStyle(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, { backgroundColor: tabStyle.backgroundColor }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon as any} size={16} color={tabStyle.textColor} />
              <Text style={[styles.tabText, { color: tabStyle.textColor }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sessions List */}
      <FlatList
        data={chargingSessions[activeTab]}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sessionsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    backgroundColor: '#000',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    
  },
  headerSpacer: {
    width: 36,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionsList: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  remindMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remindMeText: {
    fontSize: 12,
    color: '#666',
  },
  toggleOn: {
    width: 40,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stationInfo: {
    marginBottom: 16,
    position: 'relative',
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 40,
  },
  addressText: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
  },
  directionButton: {
    position: 'absolute',
    right: 0,
    top: 20,
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#fff',
    gap: 6,
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  viewDetailsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  viewDetailsButtonOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  viewDetailsButtonOutlineText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  bookAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 6,
  },
  bookAgainButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChargingHistoryScreen;