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
    if (!selectedDate || !number) return;

    const newItem = { name: number, time: content };

    const updatedItems = { ...items };
    if (!updatedItems[selectedDate]) {
      updatedItems[selectedDate] = [];
    }

    updatedItems[selectedDate].push(newItem);
    setItems(updatedItems);
    save('Termine', updatedItems);

    // Reset modal and inputs
    setModal2Visible(false);
    onChangeNumber('');
    onChangeContent('');
  }

  // Show modal on long press
  function setDayLongPress(day) {
    setModalVisible(true);
  }

  // Generate marked dates
const markedDates = Object.entries(items).reduce((acc, [date, events]) => {
  const dots = [];

  events.forEach(event => {
    if (event.dots) {
      event.dots.forEach(dot => {
        if (!dots.find(d => d.key === dot.key)) {
          dots.push(dot);
        }
      });
    }
  });

  acc[date] = {
    marked: dots.length > 0,
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
      <View key={index} style={styles.eventItem}>
        <Text style={styles.eventTitle}>{event.name}</Text>
        <Text>{event.time}</Text>
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
              <FontAwesome name="xmark" size={40} />
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
              <TouchableOpacity style={styles.weirdButton}>
                <Text style={styles.weirdText}>Arbeit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weirdButton}>
                <Text style={styles.weirdText}>Termin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weirdButton}>
                <Text style={styles.weirdText}>Aufgabe</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.weirdButton} onPress={createNew}>
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
    width: '100%',
    height: '100%',
  },
  modalView: {
    width: '100%',
    height: '100%',
    margin: 20,
    backgroundColor: 'white',
    padding: 35,
    alignItems: 'center',
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  scrollView: {
    width: '100%',
    padding: 10,
  },
  eventItem: {
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  addButton: {
    alignSelf: 'flex-end',
    margin: 15,
    backgroundColor: 'lightblue',
    borderRadius: 30,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  input: {
    height: 40,
    width: '100%',
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    marginBottom: 10,
    padding: 5,
    borderRadius: 10,
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  weirdButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: 'grey',
    marginHorizontal: 5,
  },
  weirdText: {
    color: 'white',
    textAlign: 'center',
  },
});
