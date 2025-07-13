import React, { useState, useEffect } from "react";
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

const { width } = Dimensions.get("window");

const BookingStep2Screen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the data from params
  const station = params.station ? JSON.parse(params.station as string) : null;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create car info object from received data
  const carInfo = {
    brand: carBrand,
    model: `${carModel} - ${carVersion}`,
  };

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

      allCalendarData.push({
        date: date,
        isCurrentMonth: true,
        isToday: isToday,
        isPrevMonth: false,
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

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    const price =
      connector.price ||
      (connector.currentType === "AC"
        ? station.stationConfig.priceAC
        : station.stationConfig.priceDC);

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

        slots.push({
          time: `${startTime} - ${endTime}`,
          startTime: startTime,
          endTime: endTime,
          baseDuration: 30,
          charge: parseInt(chargeLevel as string, 10),
          available: true,
          price: price,
          hour: hour,
          minute: minute,
        });
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateSelect = (dateObj) => {
    if (dateObj.isCurrentMonth) {
      setSelectedDate(dateObj.date);
      setSelectedTimeSlots([]);
    }
  };

  const handleTimeSelect = (index) => {
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

      // Verify all slots between min and max are selected (no gaps)
      let isValid = true;
      for (let i = minSelected; i <= maxSelected; i++) {
        if (!newSelection.includes(i)) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        setSelectedTimeSlots(newSelection);
      } else {
        // If there's a gap, just select the new slot
        setSelectedTimeSlots([index]);
      }
    } else {
      // Not adjacent, start new selection
      setSelectedTimeSlots([index]);
    }
  };

  const handleContinue = () => {
    if (selectedTimeSlots.length > 0 && station && chargePoint && connector) {
      const firstSlot = timeSlots[selectedTimeSlots[0]];
      const lastSlot =
        timeSlots[selectedTimeSlots[selectedTimeSlots.length - 1]];

      // Create Date objects for the selected date and time
      const selectedDateTime = new Date(
        currentYear,
        monthNames.indexOf(monthName),
        selectedDate,
        parseInt(firstSlot.startTime.split(":")[0]),
        parseInt(firstSlot.startTime.split(":")[1])
      );

      const endDateTime = new Date(
        currentYear,
        monthNames.indexOf(monthName),
        selectedDate,
        parseInt(lastSlot.endTime.split(":")[0]),
        parseInt(lastSlot.endTime.split(":")[1])
      );

      // Format as ISO 8601 strings
      const startsAt = selectedDateTime.toISOString();
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
        selectedDuration: selectedTimeSlots.length * 30, // Total minutes
        selectedCharge: firstSlot.charge,
        selectedPrice: (selectedTimeSlots.length * firstSlot.price).toFixed(2), // Total price
        month: monthName,
        year: currentYear,
        startsAt, // ISO 8601 format
        expiresAt, // ISO 8601 format
      };

      // Navigate to RecapScreen with booking data
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
    if (charge >= 70) return "#4CAF50";
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
        <ActivityIndicator size="large" color="#4CAF50" />
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
            <Ionicons name="location" size={16} color="#4CAF50" />
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
                ]}
                onPress={() => handleDateSelect(dateObj)}
                disabled={!dateObj.isCurrentMonth}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === dateObj.date &&
                      dateObj.isCurrentMonth &&
                      styles.selectedDateText,
                    dateObj.isToday && styles.todayText,
                    !dateObj.isCurrentMonth && styles.otherMonthText,
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
          {timeSlots.map((slot, index) => {
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
                  isSelected && styles.selectedTimeSlot,
                  isInRange && !isSelected && styles.rangeTimeSlot,
                  isFirstInSelection && styles.firstTimeSlot,
                  isLastInSelection && styles.lastTimeSlot,
                ]}
                onPress={() => handleTimeSelect(index)}
              >
                <Text
                  style={[
                    styles.timeText,
                    (isSelected || isInRange) && styles.selectedTimeText,
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
                    ]}
                  >
                    {getChargeIcon(slot.charge)}
                  </Text>
                  <Text
                    style={[
                      styles.chargeText,
                      { color: getChargeColor(slot.charge) },
                      (isSelected || isInRange) && styles.selectedChargeText,
                    ]}
                  >
                    {slot.charge}%
                  </Text>
                </View>
                <Text
                  style={[
                    styles.priceText,
                    (isSelected || isInRange) && styles.selectedPriceText,
                  ]}
                >
                  {slot.price} DT
                </Text>
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
    backgroundColor: "#4CAF50",
  },
  completedStep: {
    backgroundColor: "#4CAF50",
  },
  stepLabel: {
    fontSize: 12,
    color: "#999",
  },
  activeStepLabel: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  completedStepLabel: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  completedLine: {
    backgroundColor: "#4CAF50",
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
    color: "#4CAF50",
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
    backgroundColor: "#4CAF50",
  },
  todayCell: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  otherMonthCell: {
    opacity: 0.3,
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
    color: "#4CAF50",
    fontWeight: "600",
  },
  otherMonthText: {
    color: "#999",
    fontWeight: "400",
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
  },
  selectedTimeSlot: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
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
  selectedTimeText: {
    color: "#4CAF50",
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
  selectedChargeText: {
    color: "#4CAF50",
  },
  selectedChargeIcon: {
    color: "#4CAF50",
  },
  priceText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  selectedPriceText: {
    color: "#4CAF50",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  continueButton: {
    backgroundColor: "#4CAF50",
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
    backgroundColor: "#4CAF50",
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
