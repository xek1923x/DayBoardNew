import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function Stundenplan() {
  const [entries, setEntries] = useState([]);
  const [klass, setKlass] = useState('7a');
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://dsb-app-363581125799.europe-west3.run.app/entries?class=${klass}`
      );
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Vertretungsplan</Text>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      <TextInput
        style={styles.input}
        value={klass}
        onChangeText={setKlass}
        placeholder="Klasse oder Lehrerkürzel"
        placeholderTextColor="#666"
      />
      <TouchableOpacity style={styles.button} onPress={fetchEntries}>
        <Text style={styles.buttonText}>Laden</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.row,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
      ]}
    >
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cell}>{item.type}</Text>
      <Text style={styles.cell}>{item.class}</Text>
      <Text style={styles.cell}>{item.lesson}</Text>
      <Text style={styles.cell}>{item.subject}</Text>
      <Text style={styles.cell}>{item.old_teacher}</Text>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {['Datum','Art','Klasse','Stunde','Fach','Lehrer'].map((title) => (
        <Text key={title} style={styles.headerCell}>
          {title}
        </Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {renderHeader()}
        {renderControls()}
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item, idx) => `${item.lesson}-${idx}`}
            ListHeaderComponent={renderTableHeader}
            stickyHeaderIndices={[0]}
            renderItem={renderItem}
            contentContainerStyle={styles.tableContainer}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#4F6D7A',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  headerText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    margin: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: '#4F6D7A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
  tableContainer: {
    paddingBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#B0C4DE',
    paddingVertical: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: '#E8EEF4',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#444',
  },
});
