import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StationListScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // Station data with different marker colors to match the screenshot
  const stations = [
    {
      id: 1,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#4ECDC4', // Teal
    },
    {
      id: 2,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#FFB74D', // Orange/Yellow
    },
    {
      id: 3,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#4ECDC4', // Teal
    },
    {
      id: 4,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#4ECDC4', // Teal
    },
    {
      id: 5,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#FF6B6B', // Red
    },
    {
      id: 6,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#4ECDC4', // Teal
    },
    {
      id: 7,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#4ECDC4', // Teal
    },
    {
      id: 8,
      name: 'Name of the station',
      address: '685-02 street josef russ, Tunis',
      markerColor: '#4ECDC4', // Teal
    },
  ];

  const handleStationPress = (station) => {
    console.log('Station selected:', station.name);
    // Navigate to station details using Expo Router
    router.push({
      pathname: '/station-details',
      params: { stationId: station.id, stationName: station.name }
    });
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Search:', searchText);
  };

  const handleFilterPress = () => {
    // Implement filter functionality
    console.log('Filter pressed');
  };

  const handleBackPress = () => {
    
    router.back();
  };

  const renderStationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stationCard}
      onPress={() => handleStationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.stationContent}>
        <View style={styles.stationLeft}>
          {/* Station Marker */}
          <View style={[styles.stationMarker, { backgroundColor: item.markerColor }]}>
            <Ionicons name="car" size={18} color="#fff" />
          </View>
          
          {/* Station Info */}
          <View style={styles.stationInfo}>
            <Text style={styles.stationName}>{item.name}</Text>
            <Text style={styles.stationAddress}>{item.address}</Text>
          </View>
        </View>
        
        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
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
        
        <Text style={styles.headerTitle}>Stations List</Text>
        <View style={styles.headerSpacer} />
      </View>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
          </View>
          
          {/* Filter Button */}
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={handleFilterPress}
            activeOpacity={0.7}
          >
            <Ionicons name="options" size={20} color="#8c4caf" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Station List */}
      <FlatList
        data={stations}
        renderItem={renderStationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F2F2F7',
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
  searchSection: {
    backgroundColor: '#F2F2F7',
    paddingTop: 10,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  stationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
  stationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  stationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  separator: {
    height: 0,
  },
});

export default StationListScreen;