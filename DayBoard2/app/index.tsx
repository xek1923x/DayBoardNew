import React, { useState } from 'react';
import { View, Modal, Text, Pressable, StyleSheet, ScrollView, } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Collapsible from 'react-native-collapsible';

class CalendarItem{}
const MyCalendar = () => {
  const [items, setItems] = useState({
    '2024-04-29': [
      { dots: [{ key: 'work', color: 'red', selectedDotColor: 'blue' }], name: 'Deutsch Arbeit', time: '10:00 AM' },
    ],
    '2024-04-30': [
      { name: 'Englisch Arbeit', time: '9:00 AM' },
      { name: 'Project presentation', time: '2:00 PM' },
      { name: 'Project presentation', time: '5:00 PM' },
    ],
    '2024-05-01': [
      { name: 'China-Austausch', time: '9:00 AM' },
      { name: 'Project presentation', time: '2:00 PM' },
    ],
    '2024-12-11': [
      { name: 'Digitechnikum', time: '8:00 AM' },
      { name: 'Big Band', time: '3:00 PM' }
    ],
  });

  const [modalVisible, setModalVisible] = useState(false);


  const markedDates = Object.keys(items).reduce((termine, date) => {
    termine[date] = {
      marked: true,
      dots: items[date][0]?.dots || [],
    };
    return termine;
  }, {});


  const [selectedDate, setSelectedDate] = useState();
  function setDayLongPress(day) {
      setModalVisible(!modalVisible);

  }

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
          },
        }}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        onDayLongPress={(day) => {
          setDayLongPress(day)
        }}
        firstDay={1}
        showWeekNumbers={false}
        enableSwipeMonths={true}
      />


      <ScrollView
      style={styles.scrollView}>

      </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Hello World!</Text>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Hide Modal</Text>
                </Pressable>
              </View>
            </View>

          </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%',
    height:'100%',
  },
  modalView: {
    width:'100%',
    height:'100%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
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
  },
  scrollView: {
    width: "100%"

  }
});

export default MyCalendar;
