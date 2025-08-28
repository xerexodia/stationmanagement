import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { useSession } from "../../context/UserContext";

const ShowProfileScreen = () => {
  const { user, session, updateUser } = useSession();
  const router = useRouter();
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleVehiclePress = () => {
    router.push("/vehiculeList");
  };

  const handleCurrentChargingPress = () => {
    router.push("/CurrentCharging");
  };

  const handleChargingHistoryPress = () => {
    router.push("/ChargingHistory");
  };
  const handleWalletPress = () => {
    router.push("/wallet");
  };

  const handleLanguagePress = () => {
    console.log("Language pressed");
  };
  const { signOut } = useSession();

  const handleLogoutPress = async () => {
    const res = signOut();
  };

  const handleAboutPress = () => {
    console.log("About us pressed");
  };

  const handleInvitePress = () => {};

  const handleEditProfile = () => {
    router.push("/EditProfile");
  };

  const bottomTabIcons = [
    {
      name: "gas-pump",
      screen: "/HomeMap",
      isActive: false,
      iconType: "fontawesome",
    },
    { name: "flash", screen: "/Reclamations", isActive: false },
    { name: "notifications", screen: "/Notifications", isActive: false },
    { name: "person", screen: "/ShowProfile", isActive: true },
  ];

  const renderIcon = (icon) => {
    const color = icon.isActive ? "#8c4caf" : "#666";

    if (icon.iconType === "fontawesome") {
      return <FontAwesome5 name={icon.name} size={24} color={color} />;
    } else {
      return <Ionicons name={icon.name} size={24} color={color} />;
    }
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showSwitch = false,
    switchValue = false,
    onSwitchChange,
    iconColor = "#8c4caf",
    showArrow = true,
  }: {
    icon: any;
    title: any;
    subtitle?: any;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    iconColor?: string;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress} // prevent touch feedback if there's no onPress
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: iconColor === "#FF5722" ? "#FFEBEE" : "#E8F5E9",
            },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E0E0E0", true: "#8c4caf" }}
            thumbColor={switchValue ? "#fff" : "#fff"}
            ios_backgroundColor="#E0E0E0"
          />
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>
                {user?.firstname} {user?.lastname} Account
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Main Settings Section */}
        <View style={styles.settingsSection}>
          <SettingsItem
            icon="car-outline"
            title="My Vehicle"
            subtitle="Update your vehicle info"
            onPress={handleVehiclePress}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="flash"
            title="Current Charging Session"
            subtitle="View your current charging session"
            onPress={handleCurrentChargingPress}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="flash"
            title="Charging Sessions History"
            subtitle="View your charging sessions history"
            onPress={handleChargingHistoryPress}
          />
          <View style={styles.separator} />

          <SettingsItem
            icon="wallet"
            title="Wallet"
            subtitle="View your wallet"
            onPress={handleWalletPress}
          />
          <View style={styles.separator} />

          <SettingsItem
            icon="notifications-outline"
            title="App notification"
            subtitle="Pop-up notification"
            showSwitch={true}
            switchValue={appNotifications}
            onSwitchChange={setAppNotifications}
            showArrow={false}
          />

          <View style={styles.separator} />

          <SettingsItem
            icon="mail-outline"
            title="Autorise SMS and e-mails"
            subtitle="Emails notifications"
            showSwitch={true}
            switchValue={emailNotifications}
            onSwitchChange={setEmailNotifications}
            showArrow={false}
          />

          <View style={styles.separator} />

          <SettingsItem
            icon="globe-outline"
            title="Language"
            subtitle="Change language"
            onPress={handleLanguagePress}
          />

          <View style={styles.separator} />

          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Deconnection"
            onPress={handleLogoutPress}
            iconColor="#FF5722"
          />
        </View>

        {/* Secondary Settings Section */}
        <View style={styles.settingsSection}>
          <SettingsItem
            icon="information-circle-outline"
            title="About us"
            onPress={handleAboutPress}
          />

          <View style={styles.separator} />

          <SettingsItem
            icon="person-add-outline"
            title="Invite other"
            onPress={handleInvitePress}
          />
        </View>
      </ScrollView>

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
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: "#8c4caf",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  settingsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212121",
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: "#757575",
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 68,
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
});

export default ShowProfileScreen;
