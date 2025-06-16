import { 
  View, 
  Modal, 
  Keyboard, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState, useRef, useEffect } from "react";

export default function Aufgaben() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Groceries kaufen", completed: false },
    { id: 2, text: "Projekt fertigstellen", completed: false },
    { id: 3, text: "Sport machen", completed: true },
    { id: 4, text: "E-Mails beantworten", completed: false },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const addTask = () => {
    if (newTaskText.trim().length === 0) {
      Alert.alert("Fehler", "Bitte geben Sie eine Aufgabe ein");
      return;
    }
    
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

const deleteTask = (id) => {
  Alert.alert(
    "Aufgabe löschen",
    "Möchten Sie diese Aufgabe wirklich löschen?",
    [
      { text: "Abbrechen", style: "cancel" },
      { 
        text: "Löschen", 
        style: "destructive", 
        onPress: () => {
          // Filter tasks by id instead of index
          setTasks(tasks.filter(task => task.id !== id));
        }
      }
    ]
  );
};


  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meine Aufgaben</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('de-DE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
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
                { width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.tasksWrapper}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={80} color="#C0C0C0" />
              <Text style={styles.emptyStateText}>Keine Aufgaben vorhanden</Text>
              <Text style={styles.emptyStateSubtext}>Fügen Sie eine neue Aufgabe hinzu!</Text>
            </View>
          ) : (
            <ScrollView style={styles.items} showsVerticalScrollIndicator={false}>
              {tasks.map((task) => (
                <Task 
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.index)} // Toggle based on index
                  onDelete={() => deleteTask(task.id)} // Delete based on id
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Neue Aufgabe</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.textInput}
                  placeholder="Was möchten Sie erledigen?"
                  placeholderTextColor="#999"
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  multiline={true}
                  maxLength={100}
                  autoFocus={true}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Abbrechen</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.addButton]}
                    onPress={addTask}>
                    <Text style={styles.addButtonText}>Hinzufügen</Text>
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

type TaskProps = {
  task: {
    id: number;
    text: string;
    completed: boolean;
  };
  onToggle: () => void;
  onDelete: () => void;
};

export function Task({ task, onToggle, onDelete }: TaskProps) {
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
          style={[
            styles.checkbox, 
            task.completed && styles.checkboxCompleted
          ]} 
          onPress={handlePress}>
          {task.completed && <Ionicons name="checkmark" size={18} color="white" />}
        </TouchableOpacity>
        
        <Text style={[
          styles.itemText,
          task.completed && styles.itemTextCompleted
        ]}>
          {task.text}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E8EAED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
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
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  itemText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 22,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#95A5A6',
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    color: '#95A5A6',
    marginTop: 20,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});