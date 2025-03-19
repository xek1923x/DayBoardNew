import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated ,View, Modal, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity,  TextInput, TouchableWithoutFeedback } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Accordion from 'react-native-collapsible';


export default function MyCalendar() {
  const [number, onChangeNumber] = React.useState('');
  const [isCollapsedOne, setOpenedOne] = React.useState(true);
  const [isCollapsedTwo, setOpenedTwo] = React.useState(true);
  const [animation] = useState(new Animated.Value(0));
  const [iconOne, setIconOne] = React.useState("chevron-down");
  const [iconTwo, setIconTwo] = React.useState("chevron-down");

  function toggleCollapsed() {
      if (!isCollapsedOne){
        Animated.timing(animation, {
          toValue:  1,
          duration:100,
          useNativeDriver:false
        }).start()
      } else {
        Animated.timing(animation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false
        }).start()
      }
      setOpenedOne(!isCollapsedOne)
      if (iconOne	== "chevron-down") {
        setIconOne("chevron-up")
      } else{
        setIconOne("chevron-down")
      }
  }

  function toggleCollapsedTwo() {
    if (!isCollapsedTwo){
      Animated.timing(animation, {
        toValue:  1,
        duration:100,
        useNativeDriver:false
      }).start()
    } else {
      Animated.timing(animation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false
      }).start()
    }
    setOpenedTwo(!isCollapsedTwo)
    if (iconTwo	== "chevron-down") {
      setIconTwo("chevron-up")
    } else{
      setIconTwo("chevron-down")
    }
}


  
  
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

  

  
  const heightAnimationInterpolation = animation.interpolate({
    inputRange:[0, 1],
    outputRange:[0, 100]
  })
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
        <View style={styles.coolView}>
          <TouchableWithoutFeedback onPress={toggleCollapsed}>
            <View style={styles.nextToView}>
              <Text style={styles.flexElement}>
                Aufgaben
              </Text>
              <FontAwesome name={iconOne} style={styles.flexElement}/>
            </View>
          </TouchableWithoutFeedback>

          <Accordion collapsed={isCollapsedOne}>
            <View>
              <Task text={"Task 1"} /> 
              <Task text={"Task 2"} />
              <Task text={"Task 2"} />
              <Task text={"Task 2"} /> 
            </View>
          </Accordion>
        </View>


        <TouchableWithoutFeedback onPress={toggleCollapsedTwo}>
          <View style={styles.nextToView}>
            <Text style={styles.flexElement}>
              Arbeiten
            </Text>
            <FontAwesome name={iconTwo} style={styles.flexElement}/>
          </View>
        </TouchableWithoutFeedback>

        <Accordion collapsed={isCollapsedTwo}>

          <Text>
            Test Text
          </Text>
        </Accordion>


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
                <FontAwesome name="stop" size={40}/>
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

type TaskProps = {
  text: string;
};

export function Task({ text }: TaskProps) {
    return (
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={styles.square}></View>
            <Text style={styles.itemText}>{text}</Text>
          </View>
          <View style={styles.circular}></View>
        </View>
    );
}


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
  },
  nextToView: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:  20
    
  },
  coolView: {
  },
  flexElement: {

  },




  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
},
tasksWrapper: {
    paddingTop: 40,
    paddingHorizontal: 20,
},
sectionTitle: {
    paddingBottom: 15,
    fontSize: 24,
    fontWeight: 'bold',
},
items: {},
item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
},
itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
},
square: {
    width: 24,
    height: 24,
    backgroundColor: '#55BCF6',
    opacity: 0.4,
    borderRadius: 5,
    marginRight: 15,
},
itemText: {
    maxWidth: '80%',
},
circular: {
    width: 12,
    height: 12,
    borderColor: '#55BCF6',
    borderWidth: 2,
    borderRadius: 5,
},
});
