import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useReservationService } from "../../services/reservationService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useStorageState } from "../../hooks/useStorageState";

dayjs.extend(utc);

const ChargingHistoryScreen = () => {
  const [[_, sessionId], setSession] = useStorageState("sessionId");

  const [activeTab, setActiveTab] = useState<
    "UPCOMING" | "COMPLETED" | "CANCELED"
  >("UPCOMING");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState<{
    UPCOMING: any[];
    COMPLETED: any[];
    CANCELED: any[];
  }>({
    UPCOMING: [],
    COMPLETED: [],
    CANCELED: [],
  });
  const [error, setError] = useState<string | null>(null);

  const { fetchAllReservations, cancelReservation, startChargingSession } =
    useReservationService();

  const tabs = [
    { key: "UPCOMING", label: "Upcoming", icon: "refresh-outline" },
    { key: "COMPLETED", label: "Completed", icon: "checkmark-outline" },
    { key: "CANCELED", label: "Canceled", icon: "close-outline" },
  ];

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllReservations();
      setReservations(data);
    } catch (err) {
      setError("Failed to load reservations. Please try again.");
      console.error("Error loading reservations:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [])
  );

  const getTabStyle = (tabKey: string) => {
    const isActive = activeTab === tabKey;
    let backgroundColor = "#F5F5F5";
    let textColor = "#666";

    if (isActive) {
      switch (tabKey) {
        case "UPCOMING":
          backgroundColor = "#FFC107";
          textColor = "#fff";
          break;
        case "COMPLETED":
          backgroundColor = "#8c4caf";
          textColor = "#fff";
          break;
        case "CANCELED":
          backgroundColor = "#F44336";
          textColor = "#fff";
          break;
      }
    }

    return { backgroundColor, textColor };
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return {
          backgroundColor: "#FFF3CD",
          color: "#856404",
          text: "Upcoming",
        };
      case "COMPLETED":
        return {
          backgroundColor: "#D4EDDA",
          color: "#155724",
          text: "Completed",
        };
      case "CANCELED":
        return {
          backgroundColor: "#F8D7DA",
          color: "#721C24",
          text: "Canceled",
        };
      default:
        return { backgroundColor: "#F5F5F5", color: "#666", text: status };
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs.utc(dateString).local().format("MMM D, YYYY");
  };

  const formatTime = (dateString: string) => {
    return dayjs.utc(dateString).local().format("HH:mm");
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = dayjs.utc(start);
    const endDate = dayjs.utc(end);
    const diff = endDate.diff(startDate, "minute");
    return `${diff} min`;
  };

  const isSessionActive = (startsAt: string, expiresAt: string) => {
    const now = dayjs();
    const startTime = dayjs.utc(startsAt).local();
    const endTime = dayjs.utc(expiresAt).local();

    return now.isAfter(startTime) && now.isBefore(endTime);
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      // Show loading state
      setLoading(true);

      // Call the API to cancel reservation
      await cancelReservation(reservationId);

      // Refresh the reservations data
      await loadReservations();

      // Show success message
      Alert.alert(
        "Reservation Cancelled",
        "Your reservation has been successfully cancelled."
      );
    } catch (error) {
      console.error("Failed to cancel reservation:", error);

      // Show error message
      Alert.alert(
        "Cancellation Failed",
        error.message || "Failed to cancel reservation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (reservation: any) => {
    try {
      // On démarre la session et on récupère les données renvoyées par l'API
      const sessionData = await startChargingSession(reservation.id);
      if (sessionData?.data?.id) {
        const sessionId = sessionData.data.id;
        setSession(sessionId?.toString());
        router.push({
          pathname: "/CurrentCharging",
        });
      }
    } catch (error) {
      console.log("🚀 ~ handleStartSession ~ error:", error);
    }
  };

  const renderSessionCard = ({ item }: { item: any }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const duration = calculateDuration(item.startsAt, item.expiresAt);
    const canStartSession = isSessionActive(item.startsAt, item.expiresAt);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sessionDate}>{formatDate(item.startsAt)}</Text>
            <Text style={styles.sessionTime}>
              {formatTime(item.startsAt)} - {formatTime(item.expiresAt)}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {item.status === "UPCOMING" && (
              <View style={styles.remindMeContainer}>
                <Text style={styles.remindMeText}>Remind me</Text>
                <View style={styles.toggleOn}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>
            )}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusStyle.text}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>Charging Station #{item.id}</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#8c4caf" />
            <Text style={styles.addressText}>123 Charging St, City</Text>
          </View>
          <TouchableOpacity style={styles.directionButton}>
            <Ionicons name="paper-plane" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="flash" size={16} color="#666" />
            <Text style={styles.detailLabel}>Fast Charging</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Power</Text>
            <Text style={styles.detailValue}>50 kW</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>
              ${item.estimatedPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {item.status === "UPCOMING" && (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelReservation(item.id)}
              >
                <Ionicons name="close" size={16} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewDetailsButton,
                  !canStartSession && styles.disabledButton,
                ]}
                onPress={() => /*canStartSession &&*/ handleStartSession(item)}
                //  disabled={!canStartSession}
              >
                <Text
                  style={[
                    styles.viewDetailsButtonText,
                    !canStartSession && styles.disabledButtonText,
                  ]}
                >
                  {canStartSession ? "Start Session" : "Not Available"}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {/* {item.status === "COMPLETED" && (
            <>
              <TouchableOpacity
                style={styles.viewDetailsButtonOutline}
                onPress={() => handleViewDetails(item)}
              >
                <Text style={styles.viewDetailsButtonOutlineText}>
                  View details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookAgainButton}>
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.bookAgainButtonText}>Book again</Text>
              </TouchableOpacity>
            </>
          )} */}
          {/* {item.status === "CANCELED" && (
            <TouchableOpacity
              style={styles.viewDetailsButtonOutline}
              onPress={() => handleViewDetails(item)}
            >
              <Text style={styles.viewDetailsButtonOutlineText}>
                View details
              </Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8c4caf" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadReservations}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
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
        <Text style={styles.headerTitle}>Charging History</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const tabStyle = getTabStyle(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: tabStyle.backgroundColor },
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={tabStyle.textColor}
              />
              <Text style={[styles.tabText, { color: tabStyle.textColor }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sessions List */}
      {reservations[activeTab].length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="battery-dead-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            No {activeTab} reservations found
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations[activeTab]}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.sessionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8c4caf"]}
              tintColor="#8c4caf"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8c4caf",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    backgroundColor: "#000",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 36,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sessionsList: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  remindMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  remindMeText: {
    fontSize: 12,
    color: "#666",
  },
  toggleOn: {
    width: 40,
    height: 20,
    backgroundColor: "#8c4caf",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  stationInfo: {
    marginBottom: 16,
    position: "relative",
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 40,
  },
  addressText: {
    fontSize: 14,
    color: "#8c4caf",
    flex: 1,
  },
  directionButton: {
    position: "absolute",
    right: 0,
    top: 20,
    width: 32,
    height: 32,
    backgroundColor: "#8c4caf",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 16,
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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
  viewDetailsButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#8c4caf",
  },
  viewDetailsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  viewDetailsButtonOutline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8c4caf",
    backgroundColor: "#fff",
  },
  viewDetailsButtonOutlineText: {
    color: "#8c4caf",
    fontSize: 14,
    fontWeight: "500",
  },
  bookAgainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#8c4caf",
    gap: 6,
  },
  bookAgainButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default ChargingHistoryScreen;
