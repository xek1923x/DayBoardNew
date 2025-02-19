import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Modal, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity,  TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Collapsible from 'react-native-collapsible';


export default function MyCalendar() {
  const [text, onChangeText] = React.useState('Useless Text');
  const [number, onChangeNumber] = React.useState('');
  
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
  const [modal2Visible, setModal2Visible] = useState(false);

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

      <TouchableOpacity style={styles.addButton} onPress={() => {setModal2Visible(!modal2Visible)}}>
         <FontAwesome name="plus" size={40}/>
      </TouchableOpacity>
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

          <Modal
          animationType="slide"
          transparent={true}
          visible={modal2Visible}
          onRequestClose={() => {
            setModal2Visible(!modal2Visible);
          }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
              
              <TouchableOpacity style={styles.closeButton} onPress={() => {setModal2Visible(!modal2Visible)}}>
                <FontAwesome name="xmark" size={40}/>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                onChangeText={onChangeNumber}
                value={number}
                placeholder="Titel hinzufügen"
                maxLength={40}
              />

              <View style={styles.buttonView}>
                <TouchableOpacity style={[styles.weirdButton]}>
                  <Text style={styles.weirdText}>Arbeit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.weirdButton]}>
                  <Text style={styles.weirdText}>Termin</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.weirdButton]}>
                  <Text style={styles.weirdText}>Aufgabe</Text>
                </TouchableOpacity>
              </View>

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
    padding: 35,
    alignItems: 'center',
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
  },
  addButton: {
    alignSelf:  "flex-end",
    margin: 15,
    backgroundColor: "lightblue",
    borderRadius:30,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
  },
  closeButton: {
    backgroundColor: '#2196F3',
  },
  buttonView: {
     
  },
  weirdButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: "grey"
  },
  weirdText: {
    color: 'black',
    textAlign: "center",
    backgroundColor: "grey"
  }
});
