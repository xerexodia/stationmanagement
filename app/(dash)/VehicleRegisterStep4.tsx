import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter, useLocalSearchParams } from 'expo-router';

const connectorTypes = [
  { id: 'ac', label: 'Type AC' },
  { id: 'ccs', label: 'Type CCS' },
  { id: 'ad', label: 'Type AD' },
  { id: 'ab', label: 'Type AB' },
  { id: 'ae', label: 'Type AE' },
  { id: 'af', label: 'Type AF' },
];

const VehicleRegisterStep4 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedConnectors, setSelectedConnectors] = useState([]);
  const [batteryRange, setBatteryRange] = useState([1000, 1500]);
  const [horsePower, setHorsePower] = useState('150');

  const toggleConnector = (id) => {
    setSelectedConnectors((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    router.push({
      pathname: '/VehicleRegisterStep5',
      params: {
        selectedBrand: params.selectedBrand ?? '',
        selectedModel: params.selectedModel ?? '',
        selectedVersion: params.selectedVersion ?? '',
        selectedConnectors: JSON.stringify(selectedConnectors),
        batteryRange: JSON.stringify(batteryRange),
        horsePower,
      },
    });
  };

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
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                index < 3
                  ? styles.activeDot
                  : index === 3
                  ? styles.currentDot
                  : styles.inactiveDot,
              ]}
            />
            {index < 4 && <View style={styles.progressLine} />}
          </View>
        ))}
      </View>

      {/* Step Info */}
      <View style={styles.stepInfo}>
        <Text style={styles.stepLabel}>STEP 4</Text>
        <Text style={styles.stepTitle}>Choose your vehicle properties</Text>
      </View>

      {/* Connector Selection */}
      <Text style={styles.subLabel}>Select connector</Text>
      <View style={styles.connectorGrid}>
        {connectorTypes.map((type, index) => (
          <TouchableOpacity
            key={`${type.id}-${index}`}
            style={[
              styles.connectorBox,
              selectedConnectors.includes(type.id) && styles.connectorSelected,
            ]}
            onPress={() => toggleConnector(type.id)}
          >
            <Ionicons name="power" size={24} color="#333" />
            <Text style={styles.connectorLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Battery Power (KW) */}
      <Text style={styles.sectionLabel}>Battery power (KW)</Text>
      <View style={{ marginHorizontal: 10, marginTop: 10 }}>
        <MultiSlider
          values={batteryRange}
          min={75}
          max={1500}
          step={25}
          onValuesChange={(values) => setBatteryRange(values)}
          selectedStyle={{ backgroundColor: '#8c4caf' }}
          unselectedStyle={{ backgroundColor: '#E5E5E5' }}
          markerStyle={{ backgroundColor: '#8c4caf' }}
          containerStyle={{ height: 40 }}
          sliderLength={300}
        />
      </View>

      {/* Slider Labels */}
      <View style={styles.sliderLabels}>
        <Text style={styles.valueText}>75 kWh</Text>
        <Text style={styles.valueText}>{batteryRange[0]} kWh</Text>
        <Text style={styles.valueText}>{batteryRange[1]} kWh</Text>
      </View>

      {/* Horsepower */}
      <Text style={styles.subLabel}>Horsepower vehicle (HP)</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={horsePower}
          onChangeText={setHorsePower}
        />
        <Text style={styles.unit}>HP</Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { marginBottom: 10 },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#000',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: { backgroundColor: '#8c4caf' },
  currentDot: {
    backgroundColor: '#8c4caf',
    borderWidth: 3,
    borderColor: '#E8F5E8',
  },
  inactiveDot: { backgroundColor: '#E5E5E5' },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 6,
  },
  stepInfo: { marginBottom: 20 },
  stepLabel: { fontSize: 12, color: '#999', fontWeight: '600', marginBottom: 6 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  subLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  connectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  connectorBox: {
    width: '30%',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  connectorSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#8c4caf',
  },
  connectorLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  valueText: {
    fontSize: 12,
    color: '#666',
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textInput: { flex: 1, fontSize: 16 },
  unit: { fontSize: 14, color: '#666', marginLeft: 6 },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
export default VehicleRegisterStep4;