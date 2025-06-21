// src/screens/Stundenplan.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Button,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { Table, TableWrapper, Row, Cell } from "react-native-table-component";

export default function Stundenplan() {
  const [entries, setEntries] = useState<any[]>([]);
  const [klassFilter, setKlassFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [legacy, setLegacy] = useState(true);

  const YOUR_USER = "166162";
  const YOUR_PASS = "20Bueffel21";

  // --- Legacy: fetch remote API entries ---
  const fetchEntriesRemote = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://dsb-app-363581125799.europe-west3.run.app/entries"
      );
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Remote fetch error", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (legacy) {
      fetchEntriesRemote();
    }
  }, [legacy]);

  // --- Non-legacy: WebView crawling ---
  const [cookieHeader, setCookieHeader] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);

  // After login & navigation, WebView will post scraped JSON
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setEntries(data);
      setLoading(false);
    } catch (e) {
      console.error("Parsing WebView data failed", e);
    }
  };

  // Inject login script
  const startLogin = () => {
    const js = `(function() {
      document.getElementsByName('txtUser')[0].value='${YOUR_USER}';
      document.getElementsByName('txtPass')[0].value='${YOUR_PASS}';
      document.getElementsByName('ctl03')[0].click();
    })(); true;`;
    webviewRef.current?.injectJavaScript(js);
  };

  // When on dashboard page, scrape entries
  const onNavStateChange = (navState) => {
    if (navState.url.includes("Default.aspx?menu=0")) {
      const scrape = `
        (function() {
          const els = Array.from(document.querySelectorAll('.timetable-element'));
          const data = els.map(el => ({
            date: el.querySelector('.meta')?.innerText.split(' ')[0] || '',
            type: el.querySelector('.title')?.innerText || '',
            class: el.getAttribute('data-class') || '',
            lesson: el.getAttribute('data-index') || '',
            subject: el.getAttribute('data-subject') || '',
            old_teacher: el.getAttribute('data-teacher') || '',
          }));
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        })(); true;
      `;
      webviewRef.current?.injectJavaScript(scrape);
    }
  };

  // --- Filtering ---
  const filtered = entries.filter((item) => {
    const byClass =
      !klassFilter ||
      item.class.toLowerCase().includes(klassFilter.toLowerCase());
    const byTeacher =
      !teacherFilter ||
      item.old_teacher.toLowerCase().includes(teacherFilter.toLowerCase());
    return byClass && byTeacher;
  });

  // Table head and styles
  const tableHead = ["Datum", "Art", "Klasse", "Stunde", "Fach", "Lehrer"];

  // --- Render Legacy Remote Table ---
  if (legacy) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.controlsRemote}>
          <Button title="Reload Entries" onPress={fetchEntriesRemote} />
          <Button title="Switch to Crawler" onPress={() => setLegacy(false)} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Table borderStyle={{ borderWidth: 1, borderColor: "#c8e1ff" }}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
            {filtered.map((row, idx) => (
              <TableWrapper key={idx} style={styles.row}>
                <Cell data={row.date} textStyle={styles.text} />
                <Cell data={row.type} textStyle={styles.text} />
                <Cell data={row.class} textStyle={styles.text} />
                <Cell data={row.lesson} textStyle={styles.text} />
                <Cell data={row.subject} textStyle={styles.text} />
                <Cell data={row.old_teacher} textStyle={styles.text} />
              </TableWrapper>
            ))}
          </Table>
        )}
      </ScrollView>
    );
  }

  // --- Render Crawler-based Table ---
  if (!cookieHeader) {
    return (
      <View style={styles.container}>
        <WebView
          ref={webviewRef}
          source={{
            uri: "https://www.dsbmobile.de/Default.aspx?menu=0&item=0",
          }}
          onNavigationStateChange={onNavStateChange}
          onMessage={onMessage}
        />
        <Button title="Log In" onPress={startLogin} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.controlsCrawler}>
          <TextInput
            style={styles.input}
            placeholder="Klasse (z.B. 7a)"
            value={klassFilter}
            onChangeText={setKlassFilter}
          />
          <TextInput
            style={styles.input}
            placeholder="Lehrerkürzel"
            value={teacherFilter}
            onChangeText={setTeacherFilter}
          />
          <Button title="Switch to Remote" onPress={() => setLegacy(true)} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <ScrollView>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#c8e1ff" }}>
              <Row
                data={tableHead}
                style={styles.head}
                textStyle={styles.text}
              />
              {filtered.map((row, idx) => (
                <TableWrapper key={idx} style={styles.row}>
                  <Cell data={row.date} textStyle={styles.text} />
                  <Cell data={row.type} textStyle={styles.text} />
                  <Cell data={row.class} textStyle={styles.text} />
                  <Cell data={row.lesson} textStyle={styles.text} />
                  <Cell data={row.subject} textStyle={styles.text} />
                  <Cell data={row.old_teacher} textStyle={styles.text} />
                </TableWrapper>
              ))}
            </Table>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Stub parser for HTML scraping
function parseEntriesFromHtml(html: string) {
  // implement real parsing if needed
  return [];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8", padding: 16 },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6, textAlign: "center" },
  row: { flexDirection: "row", backgroundColor: "#FFF1C1" },
  controlsRemote: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  controlsCrawler: { marginBottom: 12 },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#FFF",
    marginBottom: 8,
  },
  loader: { marginTop: 20 },
});
