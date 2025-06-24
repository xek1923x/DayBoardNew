// src/screens/Stundenplan.tsx
import React, { useState, useEffect, useMemo } from "react";
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
  Switch,
} from "react-native";
import {
  setCrawlerCookie,
  login,
  getData as fetchPlanHtml,
} from "./crawler";
import * as SecureStore from "expo-secure-store";

export default function Stundenplan() {
  const [entries, setEntries] = useState<any[]>([]);
  const [klassFilter, setKlassFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [legacy, setLegacy] = useState(true);
  const [simpleNames, setSimpleNames] = useState(true);
  const [groupConnected, setGroupConnected] = useState(true);

  const YOUR_USER = "166162";
  const YOUR_PASS = "20Bueffel21";
  const CLASS_FILTER_KEY = "class_filter";
  const SETTINGS_KEY = "app_settings";

  // --- Legacy fetch ---
  const fetchEntriesRemote = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://dsb-app-363581125799.europe-west3.run.app/entries"
      );
      setEntries(await res.json());
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Crawler fetch ---
  const fetchEntriesCrawler = async () => {
    setLoading(true);
    try {
      setCrawlerCookie("");
      await login(YOUR_USER, YOUR_PASS);
      const html = await fetchPlanHtml();
      setEntries(parseEntriesFromHtml(html));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // --- on mount & legacy toggle ---
  useEffect(() => {
    (async () => {
      const savedClass = await SecureStore.getItemAsync(CLASS_FILTER_KEY);
      if (savedClass) setKlassFilter(savedClass);

      const settings = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (settings) {
        const { experimental: exp, simpleNames: simp, groupClasses: grp } = JSON.parse(settings);
        setLegacy(!exp);
        setSimpleNames(simp);
        setGroupConnected(grp);
      }
    })();

    legacy ? fetchEntriesRemote() : fetchEntriesCrawler();
  }, [legacy]);

  // --- filtered entries ---
  const filteredEntries = useMemo(
    () =>
      entries.filter((e) => {
        return filterItem(e, klassFilter, teacherFilter);
      }),
    [entries, klassFilter, teacherFilter]
  );

  function filterItem(item: any, klass: string, teacher: string) {

    const klassTerms = klass
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /[A-Za-z0-9]/.test(s));


    const okClass =
      klassTerms.length === 0 ||
      klassTerms.some((term) =>
        item.class.toLowerCase().includes(term.toLowerCase())
      );


    const teacherTerms = teacher
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /[A-Za-z0-9]/.test(s));

    const okTeacher =
      teacherTerms.length === 0 ||
      teacherTerms.some((term) =>
        item.old_teacher.toLowerCase().includes(term.toLowerCase())
      );

    return okClass && okTeacher;
  }

  const handleRefresh = () => {
    legacy ? fetchEntriesRemote() : fetchEntriesCrawler();
  };
  
  

  // --- sorted for FlatList when not grouping, and base for grouping ---
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      if (a.class < b.class) return -1;
      if (a.class > b.class) return 1;
      return Number(a.lesson) - Number(b.lesson);
    });
  }, [filteredEntries]);

  // --- annotate for grouping ---
  const connectedEntries = useMemo(() => {
    return sortedEntries.map((item, i, arr) => {
      const prev = arr[i - 1];
      const next = arr[i + 1];
      return {
        ...item,
        isFirstOfGroup: !prev || prev.class !== item.class,
        isLastOfGroup: !next || next.class !== item.class,
      };
    });
  }, [sortedEntries]);

  // --- choose data to render ---
  const dataToRender = groupConnected ? connectedEntries : sortedEntries;

  // --- color map ---
  const typeColors: Record<string, string> = {
    Vertretung: "#FFE4E1",
    "Eigenverantwortliches Arbeiten": "#FFFACD",
    "Raum-Vtr.": "#E0FFFF",
    Betreuung: "#F0FFF0",
    "Unterricht geändert": "#EDE7F6",
    "Veranst.": "#FFF5EE",
    TrotzAbsenz: "#F0F8FF",
    Klausur: "#FFDAB9",
    "Statt-Vertretung": "#FFF3E0",
    "Sondereins.": "#E0F7FA",
    default: "#FFFFFF",
  };

  // --- UI pieces ---
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
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {["Datum", "Art", "Klasse", "Stunde", "Fach", "Lehrer"].map((t) => (
        <Text key={t} style={styles.headerCell}>
          {t}
        </Text>
      ))}
    </View>
  );

  // --- item renderer ---
  const renderItem = ({ item }) => {

    const bgColor = typeColors[item.type] || typeColors.default;
    let newName = item.type;
    // simplify type name
    if (simpleNames) {
      switch (item.type) {
        case "Eigenverantwortliches Arbeiten":
          newName = "Entfall";
          break;
        case "Raum-Vtr.":
          newName = "Raum Vertretung";
          break;
        case "TrotzAbsenz":
          newName = "Trotz Absenz";
          break;
        case "Veranst.":
          newName = "Veranstaltung";
          break;
        case "Sondereins.":
          newName = "Sondereinsatz";
          break;
      }
    }

    
    return (
      <View
        style={[
          styles.row,
          { backgroundColor: bgColor },
          groupConnected && item.isFirstOfGroup && styles.firstRow,
          groupConnected && item.isLastOfGroup && styles.lastRow,
          groupConnected && !item.isLastOfGroup && styles.middleRow,
        ]}
      >
        <Text style={styles.cell}>{item.date}</Text>
        <Text style={styles.cell}>{newName}</Text>
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
            data={dataToRender}
            keyExtractor={(item, idx) => `${item.class}-${item.lesson}-${idx}`}
            ListHeaderComponent={renderTableHeader}
            renderItem={renderItem}
            contentContainerStyle={styles.tableContainer}
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// stub parser
function parseEntriesFromHtml(html: string): any[] {
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
  headerText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
  },
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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#B0C4DE",
    paddingVertical: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    overflow: "hidden",
    borderRadius: 4,
    marginVertical: 4,
  },
  firstRow: {
    marginTop: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 0
  },
  lastRow: {
    marginBottom: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 0
  },
  middleRow: {
    marginBottom: 0,
    marginTop: 0
  },
  cell: { flex: 1, textAlign: "center", color: "#444" },
});

