import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar, Agenda, CalendarList } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';


const undefineder = {key: 'Arbeit', color: 'red', selectedDotColor: 'blue'};
const veranstaltung = {key: 'Arbeit', color: 'red', selectedDotColor: 'blue'};

const MyCalendar = () => {
  const [items, setItems] = useState({
    '2024-04-29': [{dots: undefineder, name: 'Deutsch Arbeit', time: '10:00 AM' }],
    '2024-04-30': [{ name: 'Englisch Arbeit', time: '9:00 AM' }, { name: 'Project presentation', time: '2:00 PM' }, { name: 'Project presentation', time: '5:00 PM' }],
    '2024-05-01': [{ name: 'China-Austausch', time: '9:00 AM' }, { name: 'Project presentation', time: '2:00 PM' }],
    '2024-12-11': [{ name: 'Digitechnikum', time: '8:00 AM' }, { name: 'Big Band', time: '3:00 PM' }],
  });


  const [selectedDate, setSelectedDate] = useState(); 
  
  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markingType={'multi-dot'}

        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' }, 
          [items]: { dots:[undefineder] },
          '2024-12-19': {dots:[undefineder]}

        }}
        onDayPress={(day) => { setSelectedDate(day.dateString);
        
         }}
        firstDay={1}
        showWeekNumbers={false}
        enableSwipeMonths={true}
      />

    </View>
  );
}

export default MyCalendar;