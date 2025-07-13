import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CurrentChargingScreen = () => {
  const router = useRouter();
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [chargingTime, setChargingTime] = useState('00:40:12');
  const [currentAmps, setCurrentAmps] = useState(15);
  const [totalKWH, setTotalKWH] = useState(360);
  const [paymentAmount, setPaymentAmount] = useState(50);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Simulate charging progress
  useEffect(() => {
    const timer = setInterval(() => {
      setBatteryLevel(prev => {
        if (prev >= 100) {
          setShowCompletionModal(true);
          animateModal();
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 5000); // Simulate 1% increase every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const animateModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStopCharging = () => {
    router.back();
  };

  const handleValidate = () => {
    setShowCompletionModal(false);
    router.back();
  };

  const CircularProgress = ({ percentage, size = 200 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[styles.circularProgress, { width: size, height: size }]}>
        <View style={styles.circularProgressBackground}>
          <View style={styles.circularProgressInner}>
            <Ionicons name="flash" size={24} color="#FF9500" />
            <Text style={styles.kwh}>{totalKWH}</Text>
            <Text style={styles.kwhLabel}>KWH</Text>
          </View>
        </View>
        {/* This would be the actual SVG circle progress in a real implementation */}
        <View style={[styles.progressRing, { 
          borderColor: percentage === 100 ? '#4CAF50' : '#4CAF50',
          borderWidth: percentage === 100 ? 6 : 4,
        }]} />
      </View>
    );
  };

  const InfoCard = ({ icon, label, value, iconColor = '#4CAF50' }) => (
    <View style={styles.infoCard}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const BatteryCard = () => (
    <View style={styles.batteryCard}>
      <View style={styles.batteryContainer}>
        <View style={styles.batteryOuter}>
          <View style={[styles.batteryInner, { height: `${batteryLevel}%` }]} />
        </View>
        <Text style={styles.batteryPercentage}>{batteryLevel}%</Text>
      </View>
      <Text style={styles.batteryLabel}>Battery charged</Text>
      <Text style={styles.batteryValue}>{batteryLevel} %</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Charging</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Circular Progress */}
        <View style={styles.progressSection}>
          <CircularProgress percentage={batteryLevel} />
        </View>

        {/* Info Cards Grid */}
        <View style={styles.infoGrid}>
          <BatteryCard />
          
          <InfoCard
            icon="time-outline"
            label="Charging time"
            value={chargingTime}
          />
          
          <InfoCard
            icon="flash"
            label="Electricity current"
            value={`${currentAmps} Amps`}
            iconColor="#FF9500"
          />
          
          <InfoCard
            icon="card-outline"
            label="Payement"
            value={`${paymentAmount} TND`}
            iconColor="#4CAF50"
          />
        </View>

        {/* Stop Charging Button */}
        <TouchableOpacity style={styles.stopButton} onPress={handleStopCharging}>
          <Text style={styles.stopButtonText}>Stop charging</Text>
        </TouchableOpacity>
      </View>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <View style={styles.completionIcon}>
              <Ionicons name="battery-charging" size={40} color="#fff" />
            </View>
            
            <Text style={styles.completionPercentage}>100%</Text>
            <Text style={styles.completionTitle}>Charging is completed</Text>
            
            <Text style={styles.completionSubtitle}>
              Total fees is {paymentAmount} TND has been paid with e card
            </Text>
            
            <TouchableOpacity style={styles.validateButton} onPress={handleValidate}>
              <Text style={styles.validateButtonText}>Validate</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  circularProgress: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularProgressBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#2D4A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressInner: {
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  kwh: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  kwhLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  batteryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryOuter: {
    width: 30,
    height: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  batteryInner: {
    backgroundColor: '#4CAF50',
    width: '100%',
    borderRadius: 2,
  },
  batteryPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  batteryLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  batteryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stopButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  completionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completionPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 20,
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  validateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    minWidth: 120,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CurrentChargingScreen;