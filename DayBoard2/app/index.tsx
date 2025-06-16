import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Modal,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'react-native-calendars';
import * as SecureStore from 'expo-secure-store';

// Helper to format a date string for display
const formatDate = date =>
  date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

export default function MyCalendar() {
  // State vars
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [eventsByDate, setEventsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalViewVisible, setModalViewVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRepeat, setSelectedRepeat] = useState('None');
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Picker visibility & temp values
  const [pickerVisible, setPickerVisible] = useState({ date: false, time: false });
  const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'start' | 'end'
  const [tempValue, setTempValue] = useState(new Date());

  // Chosen values
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const typeColorMap = {
    Arbeit: '#007AFF',
    Termin: '#FF9500',
    Aufgabe: '#34C759'
  };

  // SecureStore helpers
  async function loadItems() {
    try {
      const json = await SecureStore.getItemAsync('Termine');
      if (json) setEventsByDate(JSON.parse(json));
    } catch (e) {
      console.error('Failed to load events', e);
    }
  }

  async function saveItems() {
    try {
      await SecureStore.setItemAsync('Termine', JSON.stringify(eventsByDate));
    } catch (e) {
      console.error('Failed to save events', e);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const timer = setTimeout(saveItems, 500);
    return () => clearTimeout(timer);
  }, [eventsByDate]);

  // Show/hide picker
  function openPicker(mode) {
    setPickerMode(mode);
    setTempValue(
      mode === 'date' && selectedDate
        ? new Date(selectedDate)
        : new Date()
    );
    setPickerVisible({ date: mode === 'date', time: mode !== 'date' });
  }
  function closePicker() {
    setPickerVisible({ date: false, time: false });
  }

  function handleConfirm(value) {
    if (pickerMode === 'date') {
      const iso = value.toISOString().split('T')[0];
      setSelectedDate(iso);
    } else {
      const hhmm = value.toTimeString().slice(0, 5);
      if (pickerMode === 'start') setStartTime(hhmm);
      if (pickerMode === 'end') setEndTime(hhmm);
    }
    closePicker();
  }

  // Create/update event
  function createOrUpdateEvent() {
    if (!selectedDate || !title || !selectedType) return;
    const newEvent = {
      title,
      details,
      start: startTime,
      end: endTime,
      type: selectedType,
      repeat: selectedRepeat,
      date: selectedDate
    };
    const updated = { ...eventsByDate };
    if (!updated[selectedDate]) updated[selectedDate] = [];
    if (editingIndex !== null) updated[selectedDate][editingIndex] = newEvent;
    else updated[selectedDate].push(newEvent);
    setEventsByDate(updated);

    // reset form
    setModalEditVisible(false);
    setTitle('');
    setDetails('');
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedType(null);
    setSelectedRepeat('None');
    setEditingIndex(null);
  }

  function handleEditEvent(index) {
    if (!selectedDate) return;
    const ev = eventsByDate[selectedDate][index];
    setTitle(ev.title);
    setDetails(ev.details);
    setStartTime(ev.start);
    setEndTime(ev.end);
    setSelectedType(ev.type);
    setSelectedRepeat(ev.repeat);
    setEditingIndex(index);
    setModalEditVisible(true);
  }

  function handleDeleteEvent(index) {
    if (!selectedDate) return;
    const updatedList = [...eventsByDate[selectedDate]];
    updatedList.splice(index, 1);
    setEventsByDate({ ...eventsByDate, [selectedDate]: updatedList });
  }

  // Recompute markedDates per month & repeats
const markedDates = useMemo(() => {
  const marks = {};
  const { year, month } = currentMonth;
  const daysInMonth = new Date(year, month, 0).getDate();

  // build all ISO dates for this month
  const monthDates = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month - 1, i + 1).toISOString().split('T')[0]
  );

  Object.entries(eventsByDate).forEach(([date, events]) => {
    events.forEach((ev, evIndex) => {
      const orig = new Date(date);
      const baseKey = `${date}-${evIndex}`;

      monthDates.forEach(dayStr => {
        const dt = new Date(dayStr);
        let mark = false;

        // always mark original on its date
        if (dayStr === date && ev.repeat === 'None') {
          mark = true;
        }
        // after original date
        if (ev.repeat === 'Daily' && dt >= orig) {
          mark = true;
        }
        if (ev.repeat === 'Weekly' && dt >= orig && dt.getDay() === orig.getDay()) {
          mark = true;
        }
        if (ev.repeat === 'Monthly' && dt >= orig && dt.getDate() === orig.getDate()) {
          mark = true;
        }

        if (mark) {
          if (!marks[dayStr]) marks[dayStr] = { dots: [] };
          marks[dayStr].dots.push({
            key: `${baseKey}-${dayStr}`,      // unique per week
            color: typeColorMap[ev.type] || '#ccc'
          });
        }
      });
    });
  });

  return Object.fromEntries(
    Object.entries(marks).map(([d, { dots }]) => [d, { marked: true, dots }])
  );
}, [eventsByDate, currentMonth]);


// Add above your render()
const eventsForSelectedDate = useMemo(() => {
  if (!selectedDate) return [];
  const sel = new Date(selectedDate);
  const results = [];

  Object.entries(eventsByDate).forEach(([origDate, evs]) => {
    const orig = new Date(origDate);
    evs.forEach(ev => {
      // skip future originals
      if (orig > sel) return;

      // exact match
      if (origDate === selectedDate) {
        results.push(ev);
        return;
      }

      // then check repeats
      if (ev.repeat === 'Daily') {
        results.push(ev);
      } else if (
        ev.repeat === 'Weekly' &&
        sel.getDay() === orig.getDay()
      ) {
        results.push(ev);
      } else if (
        ev.repeat === 'Monthly' &&
        sel.getDate() === orig.getDate()
      ) {
        results.push(ev);
      }
    });
  });

  return results;
}, [selectedDate, eventsByDate]);



  return (
    <View style={{ flex: 1 }}>
      {/* Calendar */}
      <Calendar
        markingType="multi-dot"
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#007AFF'
            }
          })
        }}
        onDayPress={day => setSelectedDate(day.dateString)}
        onDayLongPress={day => {
          setSelectedDate(day.dateString);
          setModalViewVisible(true);
        }}
        onMonthChange={({ year, month }) =>
          setCurrentMonth({ year, month })
        }
        firstDay={1}
        enableSwipeMonths
      />

      {/* Event List Header */}
      <View style={styles.listContainer}>
        <Text style={styles.selectedDateText}>
          {selectedDate
            ? formatDate(new Date(selectedDate))
            : 'Bitte Datum wählen'}
        </Text>

        {/* Event List */}
        <FlatList

          dtata={eventsForSelectedDate}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <View style={styles.eventRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {item.start && <Text>Start: {item.start}</Text>}
                {item.end && <Text>Ende: {item.end}</Text>}
                {item.details ? <Text>{item.details}</Text> : null}
                <Text style={styles.repeatText}>
                  Wiederholt: {item.repeat === 'None' ? 'Nie' : item.repeat}
                </Text>
              </View>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={() => handleEditEvent(index)}
                >
                  <Text style={styles.btnText}>Bearbeiten</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteEvent(index)}
                >
                  <Text style={styles.btnText}>Löschen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Keine Einträge</Text>
          )}
        />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalEditVisible(true)}
      >
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* View Modal */}
      <Modal
        transparent
        visible={modalViewVisible}
        animationType="slide"
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeader}>
              Events am{' '}
              {selectedDate
                ? formatDate(new Date(selectedDate))
                : ''}
            </Text>
            <FlatList
              data={eventsByDate[selectedDate] || []}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={styles.modalItem}>
                  <Text>
                    {item.start ? `${item.start} – ` : ''}
                    {item.title}{' '}
                    ({item.repeat === 'None' ? 'Nie' : item.repeat})
                  </Text>
                  {item.details ? (
                    <Text>{item.details}</Text>
                  ) : null}
                </View>
              )}
            />
            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalViewVisible(false)}
            >
              <Text style={styles.closeText}>Schließen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        transparent
        visible={modalEditVisible}
        animationType="slide"
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              onPress={() => setModalEditVisible(false)}
              style={styles.exitBtn}
            >
              <FontAwesome name="close" size={20} />
            </TouchableOpacity>

            {/* Date Picker Trigger */}
            <Pressable
              style={styles.input}
              onPress={() => openPicker('date')}
            >
              <Text>
                {selectedDate ? selectedDate : 'Datum wählen'}
              </Text>
            </Pressable>

            {/* Time Pickers */}
            <View style={styles.timeRow}>
              <Pressable
                style={[styles.input, styles.timeSelect]}
                onPress={() => openPicker('start')}
              >
                <Text>{startTime || 'Startzeit'}</Text>
              </Pressable>
              <Pressable
                style={[styles.input, styles.timeSelect]}
                onPress={() => openPicker('end')}
              >
                <Text>{endTime || 'Endzeit'}</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Titel"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Details (optional)"
              value={details}
              onChangeText={setDetails}
            />

            {/* Type Selector */}
            <View style={styles.choiceRow}>
              {['Arbeit', 'Termin', 'Aufgabe'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.choiceBtn,
                    selectedType === type && styles.choiceActive
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.choiceText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Repeat Selector */}
            <View style={styles.choiceRow}>
              {['None', 'Daily', 'Weekly', 'Monthly'].map(r => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.choiceBtn,
                    selectedRepeat === r && styles.choiceActive
                  ]}
                  onPress={() => setSelectedRepeat(r)}
                >
                  <Text style={styles.choiceText}>
                    {r === 'None' ? 'Nie' : r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.createBtn,
                (!selectedType || !title) && styles.disabledBtn
              ]}
              onPress={createOrUpdateEvent}
              disabled={!selectedType || !title}
            >
              <Text style={styles.btnText}>
                {editingIndex !== null ? 'Aktualisieren' : 'Erstellen'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DateTimePickerModal */}
      <DateTimePickerModal
        isVisible={pickerVisible.date}
        mode="date"
        date={tempValue}
        onConfirm={handleConfirm}
        onCancel={closePicker}
      />
      <DateTimePickerModal
        isVisible={pickerVisible.time}
        mode="time"
        date={tempValue}
        onConfirm={handleConfirm}
        onCancel={closePicker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20
  },
  exitBtn: { alignSelf: 'flex-end', padding: 8 },
  closeBtn: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8
  },
  closeText: { color: '#fff', textAlign: 'center' },
  modalHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  modalItem: { padding: 8, borderBottomWidth: 1, borderColor: '#eee' },
  listContainer: { flex: 1, padding: 10 },
  selectedDateText: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  eventRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fafafa',
    marginBottom: 8,
    borderRadius: 12
  },
  eventTitle: { fontWeight: '700', fontSize: 16 },
  repeatText: { fontStyle: 'italic', fontSize: 12 },
  buttonsRow: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: {
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 8,
    marginLeft: 6
  },
  deleteBtn: { backgroundColor: '#dc3545' },
  btnText: { color: '#fff', fontSize: 14 },
  empty: { fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 32,
    elevation: 5
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  choiceBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center'
  },
  choiceActive: { backgroundColor: '#005FCC', shadowOpacity: 0.4 },
  choiceText: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeSelect: { flex: 1, marginRight: 5 },
  createBtn: {
    marginTop: 10,
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center'
  },
  disabledBtn: { backgroundColor: '#ccc' }
});
