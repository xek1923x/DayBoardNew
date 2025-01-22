import React, { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

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
      { name: 'Big Band', time: '3:00 PM' },
    ],
  });

  const [selectedDate, setSelectedDate] = useState();
  function setDayLongPress

  const markedDates = Object.keys(items).reduce((termine, date) => {
    termine[date] = {
      marked: true,
      dots: items[date][0]?.dots || [],
    };
    return termine;
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
          },
        }}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        onDayLongPress={(day) => {
          
        }}
        firstDay={1}
        showWeekNumbers={false}
        enableSwipeMonths={true}
      />
    </View>
  );
};

export default MyCalendar;
