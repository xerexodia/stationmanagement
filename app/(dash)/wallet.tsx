import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Wallet = () => {
  const [balance, setBalance] = useState(2000.0);

  // Sample transaction data
  const transactions = [
    {
      id: 1,
      type: "sent",
      amount: 50.0,
      date: "Today",
      recipient: "John Doe",
      icon: "arrow-up",
    },
    {
      id: 2,
      type: "received",
      amount: 120.0,
      date: "Yesterday",
      sender: "Jane Smith",
      icon: "arrow-down",
    },
    {
      id: 3,
      type: "received",
      amount: 75.5,
      date: "Oct 12",
      sender: "Mike Johnson",
      icon: "arrow-down",
    },
    {
      id: 4,
      type: "sent",
      amount: 30.0,
      date: "Oct 10",
      recipient: "Amazon",
      icon: "arrow-up",
    },
    {
      id: 5,
      type: "sent",
      amount: 22.5,
      date: "Oct 8",
      recipient: "Netflix",
      icon: "arrow-up",
    },
  ];

  // Quick actions
  const quickActions = [
    { id: 1, title: "Send", icon: "paper-plane" },
    { id: 2, title: "Request", icon: "download" },
    { id: 3, title: "Top Up", icon: "add-circle" },
    { id: 4, title: "Scan", icon: "qr-code" },
  ];

  const renderTransactionIcon = (type) => {
    return (
      <View
        style={[
          styles.transactionIcon,
          type === "sent" ? styles.sentIcon : styles.receivedIcon,
        ]}
      >
        <Ionicons
          name={type === "sent" ? "arrow-up" : "arrow-down"}
          size={20}
          color={type === "sent" ? "#ff3b30" : "#4cd964"}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: 10,backgroundColor:"#fff" }}>
        <TouchableOpacity
          style={{ paddingHorizontal: 10 }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceText}>Total Balance</Text>
          <Text style={styles.balanceValue}>$ {balance.toFixed(2)}</Text>

          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.detailLabel}>Income</Text>
              <Text style={[styles.detailValue, styles.incomeValue]}>
                $ 1,250.00
              </Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.detailLabel}>Expenses</Text>
              <Text style={[styles.detailValue, styles.expenseValue]}>
                $ 250.00
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickAction}>
                <View style={styles.quickActionIcon}>
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color="#8c4caf"
                  />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              {renderTransactionIcon(transaction.type)}

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.type === "sent"
                    ? transaction.recipient
                    : transaction.sender}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === "sent"
                    ? styles.sentAmount
                    : styles.receivedAmount,
                ]}
              >
                {transaction.type === "sent" ? "-" : "+"} $
                {transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  balanceCard: {
    backgroundColor: "#8c4caf",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  balanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceDetailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  incomeValue: {
    color: "#4cd964",
  },
  expenseValue: {
    color: "#ff3b30",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: "#666",
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sentIcon: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  receivedIcon: {
    backgroundColor: "rgba(76, 217, 100, 0.1)",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#999",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  sentAmount: {
    color: "#ff3b30",
  },
  receivedAmount: {
    color: "#4cd964",
  },
});
