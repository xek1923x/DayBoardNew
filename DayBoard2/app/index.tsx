import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as SecureStore from 'expo-secure-store';

export default function MyCalendar() {
  const [number, onChangeNumber] = useState('');
  const [content, onChangeContent] = useState('');
  const [items, setItems] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const typeColorMap = {
  Arbeit: '#007AFF',   // Blue
  Termin: '#FF9500',   // Orange
  Aufgabe: '#34C759',  // Green
};




  // Save events to secure storage
  async function save(key, value) {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  }

  // Retrieve saved events
  async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      return JSON.parse(result);
    } else {
      return null;
    }
  }

  // Load saved items on mount
  useEffect(() => {
    async function loadItems() {
      const savedItems = await getValueFor('Termine');
      if (savedItems) {
        setItems(savedItems);
      }
    }
    loadItems();
  }, []);

  // Handle creating a new event
function createNew() {
  setSelectedType(null);
  if (!selectedDate || !number) return;

  const newItem = { name: number, time: content, type: selectedType };
  const updatedItems = { ...items };

  if (!updatedItems[selectedDate]) {
    updatedItems[selectedDate] = [];
  }

  if (editingIndex !== null) {
    // Update existing event
    updatedItems[selectedDate][editingIndex] = newItem;
  } else {
    // Add new event
    updatedItems[selectedDate].push(newItem);
  }

  setItems(updatedItems);
  save('Termine', updatedItems);

  // Reset modal and inputs
  setModal2Visible(false);
  onChangeNumber('');
  onChangeContent('');
  setEditingIndex(null);
}

  function handleEditEvent(index) {
  if (!selectedDate) return;
  const eventToEdit = items[selectedDate][index];
  onChangeNumber(eventToEdit.name);
  onChangeContent(eventToEdit.time);
  setModal2Visible(true);
  setSelectedType(eventToEdit.type);

  // Save the index being edited in state
  setEditingIndex(index);
}

// Delete event from the list
function handleDeleteEvent(index) {
  if (!selectedDate) return;
  const updatedEvents = [...items[selectedDate]];
  updatedEvents.splice(index, 1); // remove one item at index

  const updatedItems = { ...items, [selectedDate]: updatedEvents };
  setItems(updatedItems);
  save('Termine', updatedItems);
}

  // Show modal on long press
  function setDayLongPress(day) {
    setModalVisible(true);
  }

  // Generate marked dates
const markedDates = Object.entries(items).reduce((acc, [date, events]) => {
  const dots = [];

  events.forEach((event, index) => {
    const color = typeColorMap[event.type] || '#ccc'; // fallback color
    const key = `${event.type}-${index}`; // unique key per event

    dots.push({ key, color });
  });

  acc[date] = {
    marked: true,
    dots,
  };

  return acc;
}, {});




  return (
    <View style={{ flex: 1 }}>
      <Calendar
  markingType={'multi-dot'}
  markedDates={{
    ...markedDates,
    [selectedDate]: {
      selected: true,
      marked: true,
      selectedColor: 'blue',
      dots: markedDates[selectedDate]?.dots || [],
    },
  }}
  onDayPress={(day) => setSelectedDate(day.dateString)}
  onDayLongPress={(day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  }}
  firstDay={1}
  showWeekNumbers={false}
  enableSwipeMonths={true}
/>



      <ScrollView style={styles.scrollView}>
{items[selectedDate]?.length > 0 ? (
  items[selectedDate].map((event, index) => (
    <View key={index} style={styles.eventItemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{event.name}</Text>
        <Text>{event.time}</Text>
      </View>
      <View style={styles.eventButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditEvent(index)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEvent(index)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ))
) : (
  <Text style={{ padding: 10, fontStyle: 'italic' }}>
    No events for this day.
  </Text>
)}
</ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setModal2Visible(true);
        }}
      >
        <FontAwesome name="plus" size={40} />
      </TouchableOpacity>

      {/* Long Press Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Events on {selectedDate}</Text>
            {items[selectedDate]?.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text>{event.name}</Text>
                <Text>{event.time}</Text>
              </View>
            ))}
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add New Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal2Visible}
        onRequestClose={() => {
          setModal2Visible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModal2Visible(false);
              }}
            >
              <FontAwesome name="close" size={20} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              onChangeText={onChangeNumber}
              value={number}
              placeholder="Titel hinzufügen"
              maxLength={40}
            />

            <TextInput
              style={styles.input}
              onChangeText={onChangeContent}
              value={content}
              placeholder="Inhalt hinzufügen"
              maxLength={40}
            />

            <View style={styles.buttonView}>
              <TouchableOpacity style={styles.weirdButton} onPress={() => setSelectedType('Arbeit')}>
                <Text style={styles.weirdText}>Arbeit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weirdButton} onPress={() => setSelectedType('Termin')}>
                <Text style={styles.weirdText}>Termin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weirdButton} onPress={() => setSelectedType('Aufgabe')}>
                <Text style={styles.weirdText}>Aufgabe</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={createNew}>
              <Text style={styles.weirdText}>Erstellen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // dark translucent background for modal overlay
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',            // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  scrollView: {
    width: '100%',
    padding: 10,
  },
  eventItem: {
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
addButton: {
    alignSelf: 'flex-end',
    margin: 15,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    borderRadius: 30,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  input: {
    height: 45,
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
        padding: 6,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 15,
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  weirdButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 25,
    paddingVertical: 12,
    backgroundColor: '#6c757d', // nice muted grey
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginTop: 10,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 50,
    backgroundColor: '#28a745', // bootstrap green
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  weirdText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  eventItemRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
  marginBottom: 12,
  padding: 15,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},

eventButtons: {
  flexDirection: 'row',
  marginLeft: 10,
},

editButton: {
  backgroundColor: '#007bff',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 12,
  marginRight: 8,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
},

deleteButton: {
  backgroundColor: '#dc3545',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 12,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
},

buttonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 14,
},
});
