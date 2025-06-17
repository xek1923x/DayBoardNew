// Stundenplan.js
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Button,                  // ← added
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';

import { login, fetchDashboard } from './crawler.tsx';  // ← unchanged

export default function Stundenplan() {
  const [entries, setEntries] = useState([]);
  const [klassFilter, setKlassFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [legacy, setLegacy] = useState(false);

  // ── NEW WEBVIEW STATES ─────────────────────────────────────
  const [cookieHeader, setCookieHeader] = useState(null);
  const [dashboardHtml, setDashboardHtml] = useState(null);
  const webviewRef = useRef();

  const YOUR_USER = '166162';
  const YOUR_PASS = '20Bueffel21';

  // 1) watch legacy → trigger the old crawler if legacy=true
  useEffect(() => {
    if (legacy) {
      fetchEntries();
    }
  }, [legacy]);

  // 2) when we get raw HTML via WebView/axios, parse into entries
  useEffect(() => {
    if (!legacy && dashboardHtml) {
      setLoading(true);
      const parsed = parseEntriesFromHtml(dashboardHtml);
      setEntries(parsed);
      setLoading(false);
    }
  }, [dashboardHtml, legacy]);

  // ── LEGACY CODE (unchanged) ─────────────────────────────────
  const fetchEntries = async () => {
    setLoading(true);
    try {
      await login('YOUR_USERNAME', 'YOUR_PASSWORD');
      const page = await fetchDashboard();
      const parsed = parseEntriesFromHtml(page);
      setEntries(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── WEBVIEW FALLBACK (new) ──────────────────────────────────

  const onNavStateChange = navState => {
    if (navState.url.includes('Default.aspx')) {
      webviewRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage(document.cookie);
        true;
      `);
    }
  };

  const onMessage = async event => {
    const cookieStr = event.nativeEvent.data; // "ASP.NET_SessionId=…; DSBmobile=…"
    setCookieHeader(cookieStr);

    // fetch the dashboard HTML ourselves
    try {
      const { data } = await axios.get(
        'https://www.dsbmobile.de/Default.aspx?menu=0&item=0',
        { headers: { Cookie: cookieStr } }
      );
      setDashboardHtml(data);
    } catch (err) {
      console.error('Fetch dashboard failed', err);
      setDashboardHtml('');
    }
  };

  const startLogin = () => {
    webviewRef.current.injectJavaScript(`
      (function() {
        document.getElementsByName('txtUser')[0].value = '${YOUR_USER}';
        document.getElementsByName('txtPass')[0].value = '${YOUR_PASS}';
        document.getElementsByName('ctl03')[0].click();
      })();
      true;
    `);
  };

  // ── RENDERING ────────────────────────────────────────────────

  // If legacy mode is OFF, we intercept and do the WebView login:
  if (!legacy && !cookieHeader) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://www.dsbmobile.de/Login.aspx' }}
          onNavigationStateChange={onNavStateChange}
          onMessage={onMessage}
          startInLoadingState
        />
        <Button title="Log In" onPress={startLogin} />
        <Text style={{ padding: 10, color: 'gray' }}>
          Tap “Log In” to auto–fill & submit the form.
        </Text>
      </View>
    );
  }

  // Otherwise we fall back to your existing table UI:
  const filteredEntries = entries.filter(item => {
    const matchesClass =
      klassFilter === '' ||
      item.class.toLowerCase().includes(klassFilter.toLowerCase());
    const matchesTeacher =
      teacherFilter === '' ||
      item.old_teacher.toLowerCase().includes(teacherFilter.toLowerCase());
    return matchesClass && matchesTeacher;
  });

  const typeColors = {
    Vertretung: '#FFE4E1',
    'Eigenverantwortliches Arbeiten': '#FFFACD',
    'Raum-Vtr.': '#E0FFFF',
    Betreuung: '#F0FFF0',
    'Unterricht geändert': '#EDE7F6',
    'Veranst.': '#FFF5EE',
    TrotzAbsenz: '#F0F8FF',
    Klausur: '#FFDAB9',
    default: '#FFFFFF',
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Vertretungsplan</Text>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      <TextInput
        style={styles.input}
        value={klassFilter}
        onChangeText={setKlassFilter}
        placeholder="Klasse (z.B. 7a)"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        value={teacherFilter}
        onChangeText={setTeacherFilter}
        placeholder="Lehrerkürzel"
        placeholderTextColor="#666"
      />
    </View>
  );

  const renderItem = ({ item }) => {
    const bgColor = typeColors[item.type] || typeColors.default;
    return (
      <View style={[styles.row, { backgroundColor: bgColor }]}>
        <Text style={styles.cell}>{item.date}</Text>
        <Text style={styles.cell}>{item.type}</Text>
        <Text style={styles.cell}>{item.class}</Text>
        <Text style={styles.cell}>{item.lesson}</Text>
        <Text style={styles.cell}>{item.subject}</Text>
        <Text style={styles.cell}>{item.old_teacher}</Text>
      </View>
    );
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {['Datum', 'Art', 'Klasse', 'Stunde', 'Fach', 'Lehrer'].map(title => (
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
            data={filteredEntries}
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

// ── PLACEHOLDER PARSER ────────────────────────────────────
// Replace this with your real HTML→entries parser from before
function parseEntriesFromHtml(html) {
  // e.g. use regex or DOM to pull out rows into { date, type, class, ... }
  return [];
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
    justifyContent: 'space-between',
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
    borderRadius: 4,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#444',
  },
});
