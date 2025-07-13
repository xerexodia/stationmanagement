import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

const AddReclamationScreen = () => {
  const [stationName, setStationName] = useState('');
  const [reclamationType, setReclamationType] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const handleBack = () => {
    router.back();
  };

  const handleFileUpload = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setAttachedFile(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!stationName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom de la station');
      return;
    }
    if (!reclamationType.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le type de réclamation');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    // Handle form submission
    const formData = {
      stationName,
      reclamationType,
      description,
      attachedFile,
    };

    console.log('Submitting reclamation:', formData);
    Alert.alert(
        'Succès',
        'Votre réclamation a été envoyée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back(); // Navigate back only after pressing OK
            }
          }
        ]
      );
  
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter une reclamation</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Station Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Nom de Station<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="bgrtsiks"
              value={stationName}
              onChangeText={setStationName}
              placeholderTextColor="#BDBDBD"
            />
          </View>

          {/* Reclamation Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Type de réclamation<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="satisfaction"
              value={reclamationType}
              onChangeText={setReclamationType}
              placeholderTextColor="#BDBDBD"
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Description<Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Écrire ici..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#BDBDBD"
              />
              <Text style={styles.characterCount}>
                {description.length}/320
              </Text>
            </View>
          </View>

          {/* File Upload */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Pièce jointe <Text style={styles.optional}>(facultatif)</Text>
            </Text>
            <TouchableOpacity style={styles.uploadContainer} onPress={handleFileUpload}>
              <View style={styles.uploadContent}>
                {attachedFile ? (
                  <View style={styles.filePreview}>
                    <Ionicons name="document-attach" size={40} color="#4CAF50" />
                    <Text style={styles.fileName}>{attachedFile.fileName || 'Fichier sélectionné'}</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.uploadIcon}>
                      <Ionicons name="image-outline" size={40} color="#4CAF50" />
                    </View>
                    <Text style={styles.uploadText}>Cliquer pour ajouter</Text>
                    <Text style={styles.uploadSubtext}>un fichier</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Envoyer</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.submitIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 15,
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF5722',
  },
  optional: {
    color: '#757575',
    fontWeight: '400',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  characterCount: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: '#757575',
  },
  uploadContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  filePreview: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  submitContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 4,
  },
});

export default AddReclamationScreen;