import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const StationDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Info');

  const { name = 'Name of the station', stationId } = params;

  const tabs = ['Info', 'Connectors', 'Price', 'Reviews'];
  
  const handleBookPlace = () => {
    
    router.push('/BookingStep1');
  };

  const handleBackPress = () => {
    router.back();
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Station Details</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require('../../assets/Station.jpeg')}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.address}>
            <Ionicons name="location" size={16} color="#4CAF50" /> 685-02 street josef russ, sahloul 2 Tunis
          </Text>

          <View style={styles.meta}>
            <Text style={styles.status}>Available</Text>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.metaText}>4.9 (531 reviews)</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="car-outline" size={14} color="#666" />
              <Text style={styles.metaText}>800m</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>5mins away</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlinedBtn}>
              <Ionicons name="navigate" size={16} color="#4CAF50" />
              <Text style={styles.outlinedBtnText}>Get direction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filledBtn} onPress={handleBookPlace}>
              <Ionicons name="calendar" size={16} color="#fff" />
              <Text style={styles.filledBtnText}>Book a place</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'Info' && (
              <Text style={styles.infoText}>
                Lorem ipsum dolor sit amet consectetur. Feugiat facilisi aliquam sit cursus arcu suspendisse. Egestas vitae adipiscing auctor praesent scelerisque lacus viverra vestibulum...
              </Text>
            )}

            {activeTab === 'Connectors' && (
              <View>
                {[true, false].map((available, i) => (
                  <View
                    key={i}
                    style={[
                      styles.connectorCard,
                      { borderLeftColor: available ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    <Ionicons name="flash-outline" size={28} color="#000" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.connectorTitle}>11 KW</Text>
                      <Text style={styles.connectorType}>Type 2</Text>
                    </View>
                    <Text
                      style={{
                        color: available ? '#4CAF50' : '#F44336',
                        fontWeight: '600',
                      }}
                    >
                      {available ? 'Available' : 'Not Available'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'Price' && (
              <Text style={styles.infoText}>Pricing info will be added here.</Text>
            )}

            {activeTab === 'Reviews' && (
              <View style={{ alignItems: 'center', paddingTop: 20 }}>
                <Image
                  source={require('../../assets/Review.png')} 
                  style={{ width: 180, height: 180, marginBottom: 16 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                  No reviews yet
                </Text>
                <Text style={{ color: '#777', textAlign: 'center', paddingHorizontal: 32 }}>
                  Ullamco tempor adipisicing et voluptate duis sit esse aliqua esse ex.
                </Text>
                <TouchableOpacity style={[styles.filledBtn, { marginTop: 20, width: '80%' }]}>
                  <Text style={styles.filledBtnText}>Write Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.filledBtnFull} onPress={handleBookPlace}>
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.filledBtnText}>Book a place</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: { paddingBottom: 100 },
  image: {
    width: width,
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 4 },
  address: { fontSize: 14, color: '#555', marginBottom: 12 },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  status: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 25,
  },
  outlinedBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    alignItems: 'center',
  },
  outlinedBtnText: { color: '#4CAF50', fontWeight: '600' },
  filledBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    alignItems: 'center',
  },
  filledBtnText: { color: '#fff', fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  tabItem: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  tabText: { color: '#999', fontSize: 14 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4CAF50' },
  activeTabText: { color: '#4CAF50', fontWeight: '600' },
  tabContent: { paddingBottom: 30 },
  infoText: { fontSize: 14, color: '#333', lineHeight: 22 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  filledBtnFull: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  connectorCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  connectorTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  connectorType: { fontSize: 14, color: '#888' },
});

export default StationDetailsScreen;