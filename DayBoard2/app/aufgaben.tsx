// Updated full code with edit functionality and no ID usage

import {
  View,
  Modal,
  Keyboard,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState, useRef, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export default function Aufgaben() {
  const [tasks, setTasks] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [detailText, setDetailText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const addTask = () => {
    if (newTaskText.trim().length === 0) {
      Alert.alert("Fehler", "Bitte gib eine Aufgabe ein");
      return;
    }

    const date = new Date().getDate();

    if (isEditing && editingTask) {
      const updatedTasks = tasks.map((task) =>
        task.text === editingTask.text && task.date === editingTask.date
          ? { ...task, text: newTaskText.trim(), details: detailText.trim() }
          : task
      );
      setTasks(updatedTasks);

      const updatedEvents = { ...eventsByDate };
      const dateEvents = updatedEvents[editingTask.date] || [];
      updatedEvents[editingTask.date] = dateEvents.map((event) =>
        event.newTaskText === editingTask.text &&
        event.date === editingTask.date
          ? {
              ...event,
              newTaskText: newTaskText.trim(),
              detailText: detailText.trim(),
            }
          : event
      );
      setEventsByDate(updatedEvents);
    } else {
      const newTask = {
        text: newTaskText.trim(),
        details: detailText.trim(),
        completed: false,
        date,
      };

      const newFullTask = {
        newTaskText: newTaskText.trim(),
        detailText: detailText.trim(),
        start: Date.now(),
        end: Date.now(),
        type: "Aufgabe",
        repeat: false,
        date,
        completed: false,
      };

      const updatedEvents = { ...eventsByDate };
      updatedEvents[date] = [...(updatedEvents[date] || []), newFullTask];
      setEventsByDate(updatedEvents);
      setTasks([...tasks, newTask]);
    }

    setNewTaskText("");
    setDetailText("");
    setModalVisible(false);
    setIsEditing(false);
    setEditingTask(null);
    Keyboard.dismiss();
  };

  const editTask = (task) => {
    setNewTaskText(task.text);
    setDetailText(task.details || "");
    setIsEditing(true);
    setEditingTask(task);
    setModalVisible(true);
  };

  const toggleTask = (taskToToggle) => {
    const updatedTasks = tasks.map((task) =>
      task.text === taskToToggle.text && task.date === taskToToggle.date
        ? { ...task, completed: !task.completed }
        : task
    );
    setTasks(updatedTasks);

    const updatedEvents = { ...eventsByDate };
    const dateEvents = updatedEvents[taskToToggle.date] || [];
    updatedEvents[taskToToggle.date] = dateEvents.map((ev) =>
      ev.newTaskText === taskToToggle.text && ev.date === taskToToggle.date
        ? { ...ev, completed: !ev.completed }
        : ev
    );
    setEventsByDate(updatedEvents);
  };

  const deleteTask = (taskToDelete) => {
    Alert.alert(
      "Aufgabe löschen",
      "Möchtest du diese Aufgabe wirklich löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => {
            setTasks(
              tasks.filter(
                (task) =>
                  !(
                    task.text === taskToDelete.text &&
                    task.date === taskToDelete.date
                  )
              )
            );

            const updatedEvents = { ...eventsByDate };
            const dateEvents = updatedEvents[taskToDelete.date] || [];
            updatedEvents[taskToDelete.date] = dateEvents.filter(
              (ev) =>
                !(
                  ev.newTaskText === taskToDelete.text &&
                  ev.date === taskToDelete.date
                )
            );
            setEventsByDate(updatedEvents);
          },
        },
      ]
    );
  };

  async function loadItems() {
    try {
      const json = await SecureStore.getItemAsync("Termine");
      if (json) {
        const parsedEvents = JSON.parse(json);
        setEventsByDate(parsedEvents);

        const aufgaben = [];
        Object.values(parsedEvents).forEach((arr) => {
          arr.forEach((ev) => {
            if (ev.type === "Aufgabe") {
              aufgaben.push({
                text: ev.newTaskText,
                details: ev.detailText || "",
                completed: ev.completed || false,
                date: ev.date,
              });
            }
          });
        });
        setTasks(aufgaben);
      }
    } catch (e) {
      console.error("Failed to load events", e);
    }
  }

  async function saveItems() {
    try {
      await SecureStore.setItemAsync("Termine", JSON.stringify(eventsByDate));
    } catch (e) {
      console.error("Failed to save events", e);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    saveItems();
  }, [eventsByDate]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meine Aufgaben</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedTasks} von {totalTasks} erledigt
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    totalTasks > 0
                      ? `${(completedTasks / totalTasks) * 100}%`
                      : "0%",
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tasksWrapper}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle-outline"
                size={80}
                color="#C0C0C0"
              />
              <Text style={styles.emptyStateText}>
                Keine Aufgaben vorhanden
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Füge eine neue Aufgabe hinzu!
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.items}
              showsVerticalScrollIndicator={false}
            >
              {tasks.map((task, index) => (
                <Task
                  key={`${task.text}-${task.date}`}
                  task={task}
                  onToggle={() => toggleTask(task)}
                  onDelete={() => deleteTask(task)}
                  onEdit={() => editTask(task)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isEditing ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Name der Aufgabe"
                  placeholderTextColor="#999"
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  multiline={true}
                  maxLength={100}
                  autoFocus={true}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Details (optional)"
                  placeholderTextColor="#999"
                  value={detailText}
                  onChangeText={setDetailText}
                  multiline={true}
                  maxLength={200}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Abbrechen</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.addButton]}
                    onPress={addTask}
                  >
                    <Text style={styles.addButtonText}>
                      {isEditing ? "Aktualisieren" : "Hinzufügen"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Task({ task, onToggle, onDelete, onEdit }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.item, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity style={styles.itemLeft} onPress={handlePress}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
          onPress={handlePress}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={18} color="white" />
          )}
        </TouchableOpacity>
        <Text
          style={[styles.itemText, task.completed && styles.itemTextCompleted]}
        >
          {task.text}
        </Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={onEdit}
          style={{ padding: 8, marginRight: 5 }}
        >
          <Ionicons name="pencil-outline" size={20} color="#3498DB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8EAED",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ECDC4",
    borderRadius: 3,
  },
  tasksWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  items: {
    flex: 1,
  },
  item: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  itemText: {
    fontSize: 16,
    color: "#2C3E50",
    flex: 1,
    lineHeight: 22,
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: "#95A5A6",
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    color: "#95A5A6",
    marginTop: 20,
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#BDC3C7",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E8EAED",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#F8F9FA",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  addButton: {
    backgroundColor: "#4ECDC4",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  addButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
