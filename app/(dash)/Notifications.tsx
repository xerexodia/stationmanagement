import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';

const NotificationsScreen = () => {
  const router = useRouter();
  
  const [notifications] = useState([
    {
      id: 1,
      type: 'charger_unavailable',
      title: 'Charger Unavailable',
      description: 'Lorem ipsum dolor sit amet. Id beatae rerum ad nostrum consequatur aut.',
      time: '2 min',
      date: 'today',
      icon: 'flash-off',
      iconColor: '#FF5722',
      iconBg: '#FFEBEE',
    },
    {
      id: 2,
      type: 'appointment_completed',
      title: 'Appointment Completed',
      description: 'Lorem ipsum dolor sit amet. Id beatae rerum ad nostrum consequatur aut.',
      time: '5 min',
      date: 'today',
      icon: 'calendar',
      iconColor: '#8c4caf',
      iconBg: '#E8F5E8',
    },
    {
      id: 3,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      description: 'Lorem ipsum dolor sit amet. Id beatae rerum ad nostrum consequatur aut.',
      time: '12 min',
      date: 'today',
      icon: 'calendar',
      iconColor: '#2196F3',
      iconBg: '#E3F2FD',
    },
    {
      id: 4,
      type: 'new_service',
      title: 'New service for station Tunis Available',
      description: 'Lorem ipsum dolor sit amet. Id beatae rerum ad nostrum consequatur aut.',
      time: '30 min',
      date: 'today',
      icon: 'shield-checkmark',
      iconColor: '#FF9800',
      iconBg: '#FFF3E0',
    },
    {
      id: 5,
      type: 'charging_unavailable',
      title: 'Charging Unavailable',
      description: 'Lorem ipsum dolor sit amet. Id beatae rerum ad nostrum consequatur aut.',
      time: '2 min',
      date: 'yesterday',
      icon: 'flash-off',
      iconColor: '#FF5722',
      iconBg: '#FFEBEE',
    },
    {
      id: 6,
      type: 'appointment_completed',
      title: 'Appointment Completed',
      description: 'Lorem ipsum dolor sit amet. Id beatae rerum ad nostrum consequatur aut.',
      time: '5 min',
      date: 'yesterday',
      icon: 'calendar',
      iconColor: '#8c4caf',
      iconBg: '#E8F5E8',
    },
  ]);

  const bottomTabIcons = [
    { name: 'gas-pump', screen: '/HomeMap', isActive: false, iconType: 'fontawesome' },
    { name: 'flash', screen: '/Reclamations', isActive: false },
    { name: 'notifications', screen: '/Notifications', isActive: true },
    { name: 'person', screen: '/ShowProfile', isActive: false },
  ];

  const renderIcon = (icon) => {
    const color = icon.isActive ? '#8c4caf' : '#666';
    
    if (icon.iconType === 'fontawesome') {
      return (
        <FontAwesome5
          name={icon.name}
          size={24}
          color={color}
        />
      );
    } else {
      return (
        <Ionicons
          name={icon.name}
          size={24}
          color={color}
        />
      );
    }
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = notification.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {});

  const handleNotificationPress = (notification) => {
    console.log('Notification pressed:', notification.title);
  };

  const handleMenuPress = (notificationId) => {
    console.log('Menu pressed for notification:', notificationId);
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={[styles.iconContainer, { backgroundColor: notification.iconBg }]}>
        <Ionicons name={notification.icon} size={20} color={notification.iconColor} />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTime}>{notification.time}</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleMenuPress(notification.id)}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.notificationDescription}>{notification.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateSection = (date, notifications) => (
    <View key={date} style={styles.dateSection}>
      <Text style={styles.dateHeader}>
        {date.charAt(0).toUpperCase() + date.slice(1)}
      </Text>
      {notifications.map(renderNotificationItem)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/HomeMap')}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedNotifications).map(([date, notifications]) =>
          renderDateSection(date, notifications)
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomTabIcons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bottomNavItem, icon.isActive && styles.activeNavItem]}
            onPress={() => router.push(icon.screen)}
          >
            <View style={icon.isActive ? styles.activeNavIcon : null}>
              {renderIcon(icon)}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 36,
    height: 36,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  menuButton: {
    padding: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Additional styling for active item if needed
  },
  activeNavIcon: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationsScreen;