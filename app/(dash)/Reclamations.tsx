import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { useSession } from "../../context/UserContext";

const ReclamationScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("reclamations");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session, user } = useSession();

  // State for reclamation data from API
  const [reclamations, setReclamations] = useState([]);

  // Fetch reclamations from API
  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/complaints/${user?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Transform API data to match your existing structure
        const transformedData = data.data.map((complaint, index) => ({
          id: complaint.id,
          title:
            complaint.description.substring(0, 20) +
            (complaint.description.length > 20 ? "..." : ""),
          description: complaint.description,
          number: `#${complaint.id.toString().padStart(6, "0")}`,
          date:
            new Date(complaint.date).toLocaleDateString("fr-FR") +
            " " +
            new Date(complaint.date).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          status: complaint.resolved ? "completed" : "in_progress",
          resolved: complaint.resolved,
          fullDate: complaint.date,
          admin: complaint.admin,
          client: complaint.client,
        }));

        setReclamations(transformedData);
      } else {
        throw new Error(data.message || "Failed to fetch reclamations");
      }
    } catch (error) {
      console.error("Error fetching reclamations:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to load reclamations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
  }, []);

  const bottomTabIcons = [
    {
      name: "gas-pump",
      screen: "/HomeMap",
      isActive: false,
      iconType: "fontawesome",
    },
    { name: "flash", screen: "/Reclamations", isActive: true },
    { name: "notifications", screen: "/Notifications", isActive: false },
    { name: "person", screen: "/ShowProfile", isActive: false },
  ];

  const renderIcon = (icon) => {
    const color = icon.isActive ? "#8c4caf" : "#666";

    if (icon.iconType === "fontawesome") {
      return <FontAwesome5 name={icon.name} size={24} color={color} />;
    } else {
      return <Ionicons name={icon.name} size={24} color={color} />;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          text: "Completed",
          backgroundColor: "#E8F5E8",
          textColor: "#8c4caf",
          icon: "checkmark",
        };
      case "in_progress":
        return {
          text: "En cours",
          backgroundColor: "#FFF3E0",
          textColor: "#FF9800",
          icon: "time",
        };
      case "canceled":
        return {
          text: "Canceled",
          backgroundColor: "#FFEBEE",
          textColor: "#F44336",
          icon: "close",
        };
      default:
        return {
          text: "Unknown",
          backgroundColor: "#F5F5F5",
          textColor: "#666",
          icon: "help",
        };
    }
  };

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteReclamation = async (id) => {
    Alert.alert(
      "Delete Reclamation",
      "Are you sure you want to delete this reclamation? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}client/complaints/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${session}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();

              if (data.success) {
                // Remove the deleted reclamation from the list
                setReclamations(prev => prev.filter(item => item.id !== id));
                Alert.alert("Success", "Reclamation deleted successfully");
              } else {
                throw new Error(data.message || "Failed to delete reclamation");
              }
            } catch (error) {
              console.error("Error deleting reclamation:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete reclamation. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelReclamation = async (id) => {
    Alert.alert(
      "Cancel Reclamation",
      "Are you sure you want to cancel this reclamation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              // Update local state to show as canceled
              setReclamations((prev) =>
                prev.map((item) =>
                  item.id === id
                    ? { ...item, status: "canceled", resolved: false }
                    : item
                )
              );
              
              // Optional: You might want to call an API to update the status to canceled
              // await updateReclamationStatus(id, 'canceled');
            } catch (error) {
              Alert.alert("Error", "Failed to cancel reclamation");
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (item) => {
    router.push({
      pathname: "/reclamation-details",
      params: {
        id: item.id,
        title: item.title,
        description: item.description,
        number: item.number,
        date: item.date,
        fullDate: item.fullDate,
        status: item.status,
        resolved: item.resolved,
        admin: JSON.stringify(item.admin),
        client: JSON.stringify(item.client),
      },
    });
  };

  const filteredReclamations = reclamations.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    switch (activeTab) {
      case "actives":
        return matchesSearch && item.status === "in_progress";
      case "historique":
        return (
          matchesSearch &&
          (item.status === "completed" || item.status === "canceled")
        );
      default:
        return matchesSearch;
    }
  });

  // Count active reclamations for the tab label
  const activeReclamationsCount = reclamations.filter(
    (item) => item.status === "in_progress"
  ).length;

  const renderReclamationItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const isExpanded = expandedItems[item.id];
    const canCancel = item.status === "in_progress";
    const canDelete = item.status === "completed" || item.status === "canceled";

    return (
      <View style={styles.reclamationCard}>
        <TouchableOpacity
          style={styles.reclamationHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.reclamationInfo}>
            <Text style={styles.reclamationTitle}>{item.title}</Text>
            <Text style={styles.reclamationNumber}>{item.number}</Text>
            <Text style={styles.reclamationDescription} numberOfLines={1}>
              {item.description}
            </Text>
          </View>

          <View style={styles.reclamationRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.backgroundColor },
              ]}
            >
              <Ionicons
                name={statusConfig.icon as any}
                size={12}
                color={statusConfig.textColor}
              />
              <Text
                style={[styles.statusText, { color: statusConfig.textColor }]}
              >
                {statusConfig.text}
              </Text>
            </View>

            <Text style={styles.reclamationDate}>{item.date}</Text>

            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedActions}>
            {canCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelReclamation(item.id)}
              >
                <Ionicons name="close" size={16} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel reclamation</Text>
              </TouchableOpacity>
            )}

            {canDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteReclamation(item.id)}
              >
                <Ionicons name="trash" size={16} color="#F44336" />
                <Text style={styles.deleteButtonText}>Delete reclamation</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleViewDetails(item)}
            >
              <Text style={styles.viewDetailsButtonText}>View details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8c4caf" />
          <Text style={styles.loadingText}>Loading reclamations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>Error loading reclamations</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchReclamations()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reclamations</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "reclamations" && styles.activeTab]}
          onPress={() => setActiveTab("reclamations")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "reclamations" && styles.activeTabText,
            ]}
          >
            Reclamations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "actives" && styles.activeTab]}
          onPress={() => setActiveTab("actives")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "actives" && styles.activeTabText,
            ]}
          >
            Actives ({activeReclamationsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "historique" && styles.activeTab]}
          onPress={() => setActiveTab("historique")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "historique" && styles.activeTabText,
            ]}
          >
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#8c4caf" />
        </TouchableOpacity>
      </View>

      {/* Reclamations List */}
      {filteredReclamations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No reclamations found</Text>
          <Text style={styles.emptySubText}>
            {searchQuery
              ? "Try a different search term"
              : "You have no reclamations yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReclamations}
          renderItem={renderReclamationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/AddReclamation")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomTabIcons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.bottomNavItem,
              icon.isActive && styles.activeNavItem,
            ]}
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  activeTab: {
    backgroundColor: "#8c4caf",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  reclamationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  reclamationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  reclamationInfo: {
    flex: 1,
  },
  reclamationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reclamationNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reclamationDescription: {
    fontSize: 12,
    color: "#999",
  },
  reclamationRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  reclamationDate: {
    fontSize: 12,
    color: "#999",
  },
  expandedActions: {
    flexDirection: "row",
    padding: 15,
    paddingTop: 0,
    gap: 10,
    flexWrap: "wrap",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F44336",
    backgroundColor: "#fff",
    gap: 6,
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F44336",
    backgroundColor: "#fff",
    gap: 6,
  },
  deleteButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "500",
  },
  viewDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#8c4caf",
  },
  viewDetailsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8c4caf",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    // Additional styling for active item if needed
  },
  activeNavIcon: {
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  errorSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8c4caf",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
});

export default ReclamationScreen;