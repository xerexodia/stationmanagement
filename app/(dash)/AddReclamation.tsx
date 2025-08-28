import React, { useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSession } from "../../context/UserContext";

const AddReclamationScreen = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { session, user } = useSession();

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une description");
      return;
    }

    if (description.length > 320) {
      Alert.alert("Erreur", "La description ne peut pas dépasser 320 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/complaints/${user?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify({
          description: description.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Succès", "Votre réclamation a été envoyée avec succès!", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/Reclamations");
            },
          },
        ]);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi de la réclamation');
      }
    } catch (error) {
      console.error('Error submitting reclamation:', error);
      Alert.alert(
        "Erreur", 
        error.message || "Une erreur s'est produite lors de l'envoi de votre réclamation. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
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
                maxLength={320}
                editable={!loading}
              />
              <Text style={styles.characterCount}>
                {description.length}/320
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Envoyer</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
                style={styles.submitIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
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
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF5722",
  },
  optional: {
    color: "#757575",
    fontWeight: "400",
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textAreaContainer: {
    position: "relative",
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 120,
  },
  characterCount: {
    position: "absolute",
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: "#757575",
  },
  uploadContainer: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#8c4caf",
    borderStyle: "dashed",
    borderRadius: 8,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    color: "#8c4caf",
    fontWeight: "500",
  },
  uploadSubtext: {
    fontSize: 16,
    color: "#8c4caf",
    fontWeight: "500",
  },
  filePreview: {
    alignItems: "center",
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  submitContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#8c4caf",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 4,
  },
});

export default AddReclamationScreen;