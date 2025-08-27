import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSession } from "../../context/UserContext";

const { width } = Dimensions.get("window");

const BookingStep2Screen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const station = params.station ? JSON.parse(params.station as string) : null;
  const { session } = useSession();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse the data from params
  const chargePoint = params.chargePoint
    ? JSON.parse(params.chargePoint as string)
    : null;
  const connector = params.connector
    ? JSON.parse(params.connector as string)
    : null;
  const chargeLevel = params.chargeLevel || "75";
  const carBrand = params.carBrand || "Toyota";
  const carModel = params.carModel || "Model X";
  const carVersion = params.carVersion || "Version 2022";

  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [currentWeek, setCurrentWeek] = useState(0);

  // Current date for comparison
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonthIndex = currentDate.getMonth() + 1;
  const currentYearValue = currentDate.getFullYear();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  // Create car info object from received data
  const carInfo = {
    brand: carBrand,
    model: `${carModel} - ${carVersion}`,
  };

  // Fetch reservations data
  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}client/reservations/station/${station.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session}`,
            },
          }
        );

        const responseText = await response.text();

        if (!responseText) {
          if (response.ok) {
            throw new Error("Station data not available");
          }
          throw new Error("Server returned empty response");
        }

        let parsedData;
        try {
          parsedData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Invalid server response format");
        }

        if (!response.ok) {
          const errorMessage =
            parsedData.message ||
            parsedData.error ||
            `Server returned status ${response.status}`;
          throw new Error(errorMessage);
        }

        setReservations(parsedData?.data || []);
      } catch (error) {
        console.error("Error fetching station:", error);
        setError(error.message || "Failed to load station details");
      } finally {
        setLoading(false);
      }
    };

    if (station) {
      fetchStationDetails();
    }
  }, [station?.id]);

  // Generate complete month calendar data and return specific week
  const generateCalendarData = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    const allCalendarData = [];

    // Add days from previous month (grayed out)
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      allCalendarData.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    // Add all days of current month
    for (let date = 1; date <= daysInMonth; date++) {
      const today = new Date();
      const isToday =
        today.getDate() === date &&
        today.getMonth() === month - 1 &&
        today.getFullYear() === year;
      
      // Check if date is in the past
      const isPastDate =
        year < currentYearValue ||
        (year === currentYearValue && month < currentMonthIndex) ||
        (year === currentYearValue && month === currentMonthIndex && date < currentDay);

      allCalendarData.push({
        date: date,
        isCurrentMonth: true,
        isToday: isToday,
        isPrevMonth: false,
        isPastDate: isPastDate,
      });
    }

    // Add days from next month to complete the grid
    const remainingCells =
      Math.ceil(allCalendarData.length / 7) * 7 - allCalendarData.length;
    for (let date = 1; date <= remainingCells; date++) {
      allCalendarData.push({
        date: date,
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }

    // Split into weeks
    const weeks = [];
    for (let i = 0; i < allCalendarData.length; i += 7) {
      weeks.push(allCalendarData.slice(i, i + 7));
    }

    return weeks;
  };

  // Get current week data
  const getCurrentWeekData = () => {
    const weeks = generateCalendarData(currentMonth, currentYear);
    return weeks[currentWeek] || [];
  };

  // Get total number of weeks in current month
  const getTotalWeeks = () => {
    const weeks = generateCalendarData(currentMonth, currentYear);
    return weeks.length;
  };

  // Month names array
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
      setMonthName(monthNames[11]);
    } else {
      setCurrentMonth(currentMonth - 1);
      setMonthName(monthNames[currentMonth - 2]);
    }
    setCurrentWeek(0); // Reset to first week when changing month
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
      setMonthName(monthNames[0]);
    } else {
      setCurrentMonth(currentMonth + 1);
      setMonthName(monthNames[currentMonth]);
    }
    setCurrentWeek(0); // Reset to first week when changing month
  };

  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    } else {
      // Go to previous month's last week
      handlePreviousMonth();
      // Set to last week of previous month after state updates
      setTimeout(() => {
        const totalWeeks = getTotalWeeks();
        setCurrentWeek(totalWeeks - 1);
      }, 0);
    }
  };

  const handleNextWeek = () => {
    const totalWeeks = getTotalWeeks();
    if (currentWeek < totalWeeks - 1) {
      setCurrentWeek(currentWeek + 1);
    } else {
      // Go to next month's first week
      handleNextMonth();
      // currentWeek is already reset to 0 in handleNextMonth
    }
  };

  // Generate time slots with availability based on reservations
  const generateTimeSlots = useMemo(() => {
    const slots = [];
    const startHour = 8;
    const endHour = 24;
    const price =
      connector.price ||
      (connector.currentType === "AC"
        ? station.stationConfig.priceAC
        : station.stationConfig.priceDC);

    // Filter active reservations (not canceled or expired)
    const activeReservations = reservations.filter(
      (res) => res.status !== "CANCELED" && res.status !== "EXPIRED"
    );

    // Check if the selected date is today
    const isToday =
      selectedDate === currentDay &&
      currentMonth === currentMonthIndex &&
      currentYear === currentYearValue;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const endMinute = minute + 30;
        const endHourAdj = endMinute >= 60 ? hour + 1 : hour;
        const adjMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${endHourAdj.toString().padStart(2, "0")}:${adjMinute
          .toString()
          .padStart(2, "0")}`;

        // Create Date objects for this slot
        const slotStartDate = new Date(
          currentYear,
          currentMonth - 1,
          selectedDate,
          hour,
          minute
        );
        const slotEndDate = new Date(
          currentYear,
          currentMonth - 1,
          selectedDate,
          endHourAdj,
          adjMinute
        );

        // Check if this slot is in the past (for today)
        let isPastTime = false;
        if (isToday) {
          isPastTime =
            hour < currentHours ||
            (hour === currentHours && minute < currentMinutes);
        }

        // Check if this slot overlaps with any active reservation
        let isReserved = false;
        for (const reservation of activeReservations) {
          const resStart = new Date(reservation.startsAt);
          const resEnd = new Date(reservation.expiresAt);

          // Check if the reservation is for the same date
          if (
            resStart.getDate() === selectedDate &&
            resStart.getMonth() === currentMonth - 1 &&
            resStart.getFullYear() === currentYear
          ) {
            // Check for time overlap
            if (
              (slotStartDate >= resStart && slotStartDate < resEnd) ||
              (slotEndDate > resStart && slotEndDate <= resEnd) ||
              (slotStartDate <= resStart && slotEndDate >= resEnd)
            ) {
              isReserved = true;
              break;
            }
          }
        }

        slots.push({
          time: `${startTime} - ${endTime}`,
          startTime: startTime,
          endTime: endTime,
          baseDuration: 30,
          charge: parseInt(chargeLevel as string, 10),
          available: !isPastTime && !isReserved,
          price: price,
          hour: hour,
          minute: minute,
          isPastTime: isPastTime,
          isReserved: isReserved,
        });
      }
    }

    return slots;
  }, [selectedDate, currentMonth, currentYear, reservations, chargeLevel]);

  const handleDateSelect = (dateObj) => {
    if (dateObj.isCurrentMonth && !dateObj.isPastDate) {
      setSelectedDate(dateObj.date);
      setSelectedTimeSlots([]);
    }
  };

  const handleTimeSelect = (index) => {
    const slot = generateTimeSlots[index];
    
    // Don't allow selection if slot is not available
    if (!slot.available) {
      return;
    }

    // If no slots are selected yet, just select this one
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([index]);
      return;
    }

    // If clicking on an already selected slot, deselect it
    if (selectedTimeSlots.includes(index)) {
      setSelectedTimeSlots([]);
      return;
    }

    // Get the min and max of currently selected slots
    const minSelected = Math.min(...selectedTimeSlots);
    const maxSelected = Math.max(...selectedTimeSlots);

    // Check if the new slot is adjacent to the current selection
    if (index === minSelected - 1 || index === maxSelected + 1) {
      // Create new array with the new slot added
      const newSelection = [...selectedTimeSlots, index].sort((a, b) => a - b);

      // Verify all slots between min and max are available and not reserved
      let isValid = true;
      for (let i = Math.min(index, minSelected); i <= Math.max(index, maxSelected); i++) {
        if (!generateTimeSlots[i].available || !newSelection.includes(i)) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        setSelectedTimeSlots(newSelection);
      } else {
        // If there's a gap or unavailable slot, just select the new slot
        setSelectedTimeSlots([index]);
      }
    } else {
      // Not adjacent, start new selection
      setSelectedTimeSlots([index]);
    }
  };

  const handleContinue = () => {
    if (selectedTimeSlots.length > 0 && station && chargePoint && connector) {
      // first and last slot objects
      const firstSlot = generateTimeSlots[selectedTimeSlots[0]];
      const lastSlot =
        generateTimeSlots[selectedTimeSlots[selectedTimeSlots.length - 1]];

      // build Date objects
      const monthIndex = monthNames.indexOf(monthName); // 0‑based
      const [startHour, startMin] = firstSlot.startTime.split(":").map(Number);
      const [endHour, endMin] = lastSlot.endTime.split(":").map(Number);

      const startDateTime = new Date(
        currentYear,
        monthIndex,
        selectedDate,
        startHour,
        startMin
      );

      const endDateTime = new Date(
        currentYear,
        monthIndex,
        selectedDate,
        endHour,
        endMin
      );

      // ISO strings
      const startsAt = startDateTime.toISOString();
      const expiresAt = endDateTime.toISOString();

      const bookingData = {
        station: JSON.stringify(station),
        chargePoint: JSON.stringify(chargePoint),
        connector: JSON.stringify(connector),
        chargeLevel,
        carBrand: carInfo.brand,
        carModel: carInfo.model,
        selectedDate,
        selectedTime: `${firstSlot.startTime} - ${lastSlot.endTime}`,
        selectedDuration: selectedTimeSlots.length * 30, // minutes
        selectedCharge: firstSlot.charge,
        selectedPrice: (selectedTimeSlots.length * firstSlot.price).toFixed(2),
        month: monthName,
        year: currentYear,
        startsAt,
        expiresAt,
      };

      router.push({
        pathname: "/Recap",
        params: bookingData,
      });
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const getChargeIcon = (charge) => {
    if (charge >= 70) return "⚡";
    if (charge >= 40) return "⚡";
    return "⚡";
  };

  const getChargeColor = (charge) => {
    if (charge >= 70) return "#8c4caf";
    if (charge >= 40) return "#FF9800";
    return "#FF9800";
  };

  const isSlotSelected = (index) => {
    return selectedTimeSlots.includes(index);
  };

  const isSlotInSelectionRange = (index) => {
    if (selectedTimeSlots.length === 0) return false;

    const minSelected = Math.min(...selectedTimeSlots);
    const maxSelected = Math.max(...selectedTimeSlots);

    return index >= minSelected && index <= maxSelected;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8c4caf" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!station || !chargePoint || !connector) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Booking data not available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.completedStepLabel]}>
            Vehicle
          </Text>
        </View>

        <View style={[styles.progressLine, styles.completedLine]} />

        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.activeStepLabel]}>
            Reservation
          </Text>
        </View>

        <View style={styles.progressLine} />

        <View style={styles.progressStep}>
          <View style={styles.stepCircle}>
            <Ionicons name="receipt-outline" size={16} color="#ccc" />
          </View>
          <Text style={styles.stepLabel}>Summary</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Ionicons name="location" size={16} color="#8c4caf" />
            <Text style={styles.summaryText}>{station.name}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="flash" size={16} color="#666" />
            <Text style={styles.summaryText}>
              Charge Point #{chargePoint.id} -{" "}
              {connector.currentType.toUpperCase()}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="car" size={16} color="#666" />
            <Text style={styles.summaryText}>
              {carInfo.brand} - {carInfo.model}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.chargeIcon}>⚡</Text>
            <Text style={styles.summaryText}>{chargeLevel}%</Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="pricetag" size={16} color="#666" />
            <Text style={styles.summaryText}>
              {connector.price} DT/kWh ({connector.power} kW)
            </Text>
          </View>
        </View>

        {/* Select Date Section */}
        <Text style={styles.sectionTitle}>Select date</Text>

        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={handlePreviousMonth}
              style={styles.monthArrow}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {monthName} {currentYear}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              style={styles.monthArrow}
            >
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Week Navigation */}
          <View style={styles.weekNavigationContainer}>
            <TouchableOpacity onPress={handlePreviousWeek}>
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNextWeek}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            <Text style={styles.weekDay}>SUN</Text>
            <Text style={styles.weekDay}>MON</Text>
            <Text style={styles.weekDay}>TUE</Text>
            <Text style={styles.weekDay}>WED</Text>
            <Text style={styles.weekDay}>THU</Text>
            <Text style={styles.weekDay}>FRI</Text>
            <Text style={styles.weekDay}>SAT</Text>
          </View>

          <View style={styles.calendarGrid}>
            {getCurrentWeekData().map((dateObj, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCell,
                  selectedDate === dateObj.date &&
                    dateObj.isCurrentMonth &&
                    styles.selectedDateCell,
                  dateObj.isToday && styles.todayCell,
                  !dateObj.isCurrentMonth && styles.otherMonthCell,
                  dateObj.isPastDate && styles.pastDateCell,
                ]}
                onPress={() => handleDateSelect(dateObj)}
                disabled={!dateObj.isCurrentMonth || dateObj.isPastDate}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === dateObj.date &&
                      dateObj.isCurrentMonth &&
                      styles.selectedDateText,
                    dateObj.isToday && styles.todayText,
                    !dateObj.isCurrentMonth && styles.otherMonthText,
                    dateObj.isPastDate && styles.pastDateText,
                  ]}
                >
                  {dateObj.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Select Time Section */}
        <Text style={styles.sectionTitle}>Select time</Text>

        <View style={styles.timeSlotsInfo}>
          <Text style={styles.timeSlotsInfoText}>
            {selectedTimeSlots.length > 0
              ? `Selected: ${selectedTimeSlots.length * 30} minutes`
              : "Select one or more consecutive time slots"}
          </Text>
          {selectedTimeSlots.length > 0 && (
            <Text style={styles.timeSlotsPriceText}>
              Total: {(selectedTimeSlots.length * connector.price).toFixed(2)}{" "}
              DT
            </Text>
          )}
        </View>

        <View style={styles.timeSlotsContainer}>
          {generateTimeSlots.map((slot, index) => {
            const isSelected = isSlotSelected(index);
            const isInRange = isSlotInSelectionRange(index);
            const isFirstInSelection =
              isSelected && index === Math.min(...selectedTimeSlots);
            const isLastInSelection =
              isSelected && index === Math.max(...selectedTimeSlots);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  !slot.available && styles.unavailableTimeSlot,
                  isSelected && styles.selectedTimeSlot,
                  isInRange && !isSelected && styles.rangeTimeSlot,
                  isFirstInSelection && styles.firstTimeSlot,
                  isLastInSelection && styles.lastTimeSlot,
                ]}
                onPress={() => handleTimeSelect(index)}
                disabled={!slot.available}
              >
                <Text
                  style={[
                    styles.timeText,
                    (isSelected || isInRange) && styles.selectedTimeText,
                    !slot.available && styles.unavailableTimeText,
                  ]}
                >
                  {slot.startTime} - {slot.endTime}
                </Text>
                <View style={styles.chargeInfo}>
                  <Text
                    style={[
                      styles.chargeIcon,
                      { color: getChargeColor(slot.charge) },
                      (isSelected || isInRange) && styles.selectedChargeIcon,
                      !slot.available && styles.unavailableChargeIcon,
                    ]}
                  >
                    {getChargeIcon(slot.charge)}
                  </Text>
                  <Text
                    style={[
                      styles.chargeText,
                      { color: getChargeColor(slot.charge) },
                      (isSelected || isInRange) && styles.selectedChargeText,
                      !slot.available && styles.unavailableChargeText,
                    ]}
                  >
                    {slot.charge}%
                  </Text>
                </View>
                <Text
                  style={[
                    styles.priceText,
                    (isSelected || isInRange) && styles.selectedPriceText,
                    !slot.available && styles.unavailablePriceText,
                  ]}
                >
                  {slot.price} DT
                </Text>
                {slot.isReserved && (
                  <View style={styles.reservedBadge}>
                    <Text style={styles.reservedBadgeText}>Reserved</Text>
                  </View>
                )}
                {slot.isPastTime && (
                  <View style={styles.pastTimeBadge}>
                    <Text style={styles.pastTimeBadgeText}>Past</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedTimeSlots.length === 0 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={selectedTimeSlots.length === 0}
        >
          <Text
            style={[
              styles.continueButtonText,
              selectedTimeSlots.length === 0 && styles.disabledButtonText,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
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
    width: 36,
    height: 36,
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  progressStep: {
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: "#8c4caf",
  },
  completedStep: {
    backgroundColor: "#8c4caf",
  },
  stepLabel: {
    fontSize: 12,
    color: "#999",
  },
  activeStepLabel: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  completedStepLabel: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  completedLine: {
    backgroundColor: "#8c4caf",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  chargeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  timeSlotsInfo: {
    marginBottom: 15,
  },
  timeSlotsInfoText: {
    fontSize: 14,
    color: "#666",
  },
  timeSlotsPriceText: {
    fontSize: 14,
    color: "#8c4caf",
    fontWeight: "600",
    marginTop: 5,
  },
  calendarContainer: {
    marginBottom: 30,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  weekNavigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  weekDay: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    width: 40,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dateCell: {
    width: (width - 40) / 7 - 2,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 22,
  },
  selectedDateCell: {
    backgroundColor: "#8c4caf",
  },
  todayCell: {
    borderWidth: 2,
    borderColor: "#8c4caf",
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  pastDateCell: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedDateText: {
    color: "#fff",
    fontWeight: "600",
  },
  todayText: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  otherMonthText: {
    color: "#999",
    fontWeight: "400",
  },
  pastDateText: {
    color: "#999",
    textDecorationLine: "line-through",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeSlot: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  unavailableTimeSlot: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },
  selectedTimeSlot: {
    backgroundColor: "#E8F5E9",
    borderColor: "#8c4caf",
    borderWidth: 2,
    borderRadius: 8,
  },
  rangeTimeSlot: {
    backgroundColor: "#F1F8E9",
    borderColor: "#A5D6A7",
    borderWidth: 1,
  },
  firstTimeSlot: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
  },
  lastTimeSlot: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
  },
  timeText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 5,
    textAlign: "center",
  },
  unavailableTimeText: {
    color: "#999",
  },
  selectedTimeText: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  chargeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  chargeText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  unavailableChargeText: {
    color: "#999",
  },
  selectedChargeText: {
    color: "#8c4caf",
  },
  selectedChargeIcon: {
    color: "#8c4caf",
  },
  unavailableChargeIcon: {
    color: "#999",
  },
  priceText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  unavailablePriceText: {
    color: "#999",
  },
  selectedPriceText: {
    color: "#8c4caf",
  },
  reservedBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FFCDD2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reservedBadgeText: {
    fontSize: 10,
    color: "#C62828",
    fontWeight: "600",
  },
  pastTimeBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pastTimeBadgeText: {
    fontSize: 10,
    color: "#616161",
    fontWeight: "600",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  continueButton: {
    backgroundColor: "#8c4caf",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#999",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8c4caf",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookingStep2Screen;