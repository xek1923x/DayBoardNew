import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';


const MyCalendar = () => {

  const [items, setItems] = useState({
    '2024-04-29': [{ name: 'Deutsch Arbeit', time: '10:00 AM' }],
    '2024-04-30': [{ name: 'Englisch Arbeit', time: '9:00 AM' }, { name: 'Project presentation', time: '2:00 PM' }, { name: 'Project presentation', time: '5:00 PM' }],
    '2024-05-01': [{ name: 'China-Austausch', time: '9:00 AM' }, { name: 'Project presentation', time: '2:00 PM' }],
    '2024-12-11': [{ name: 'Digitechnikum', time: '8:00 AM' }, { name: 'Big Band', time: '3:00 PM' }],
  });


  const [selectedDate, setSelectedDate] = useState(); 
  
  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' }, 
        }}
        onDayPress={(day) => { setSelectedDate(day.dateString); }} 
      />

    <Agenda
        items={items} 
        renderItem={(item) => (
          <View style={{ marginVertical: 10, marginTop: 30,backgroundColor:'white',marginHorizontal:10,  padding: 10 }}>
           <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.time}</Text>
        </View>
        )} 
      />

    </View>
  );
}

export default MyCalendar;