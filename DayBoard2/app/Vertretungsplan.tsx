// src/screens/Stundenplan.tsx
import React, { useState, useEffect } from "react";
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
  Button,
} from "react-native";
import {
  setCrawlerCookie,
  login,
  getData as fetchPlanHtml,
} from "./crawler"; // adjust relative path

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
      console.error(err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Non-legacy: crawler fetching + HTML parsing ---
  const fetchEntriesCrawler = async () => {
    setLoading(true);
    try {
      // initialize cookie (if persisted) or empty
      setCrawlerCookie("");
      await login(YOUR_USER, YOUR_PASS);
      const html = await fetchPlanHtml();
      const data = parseEntriesFromHtml(html);
      setEntries(data);
    } catch (err) {
      console.error("Crawler error", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Kick off on mount and on toggle
  useEffect(() => {
    if (legacy) fetchEntriesRemote();
    else fetchEntriesCrawler();
  }, [legacy]);

  const filteredEntries = entries.filter(item => {
    const matchesClass =
      !klassFilter || item.class.toLowerCase().includes(klassFilter.toLowerCase());
    const matchesTeacher =
      !teacherFilter || item.old_teacher.toLowerCase().includes(teacherFilter.toLowerCase());
    return matchesClass && matchesTeacher;
  });

  const typeColors: Record<string, string> = {
    Vertretung: "#FFE4E1",
    "Eigenverantwortliches Arbeiten": "#FFFACD",
    "Raum-Vtr.": "#E0FFFF",
    Betreuung: "#F0FFF0",
    "Unterricht geändert": "#EDE7F6",
    "Veranst.": "#FFF5EE",
    TrotzAbsenz: "#F0F8FF",
    Klausur: "#FFDAB9",
    default: "#FFFFFF",
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
      {/*<Button
        title={legacy ? "Crawler-Modus" : "Legacy-Modus"}
        onPress={() => setLegacy(prev => !prev)}
      />*/}
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {["Datum", "Art", "Klasse", "Stunde", "Fach", "Lehrer"].map(title => (
        <Text key={title} style={styles.headerCell}>{title}</Text>
      ))}
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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

// Simple HTML parser stub
function parseEntriesFromHtml(html: string): any[] {
  // TODO: implement real parsing with cheerio or regex
  return [];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  headerContainer: {
    padding: 16,
    backgroundColor: "#4F6D7A",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  headerText: { fontSize: 24, color: "#FFF", fontWeight: "bold", textAlign: "center" },
  controls: { flexDirection: "row", alignItems: "center", margin: 16, justifyContent: "space-between" },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loader: { marginTop: 20 },
  tableContainer: { paddingBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#B0C4DE", paddingVertical: 8 },
  headerCell: { flex: 1, fontWeight: "600", textAlign: "center", color: "#333" },
  row: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderRadius: 4, marginVertical: 4, marginHorizontal: 8 },
  cell: { flex: 1, textAlign: "center", color: "#444" },
});
