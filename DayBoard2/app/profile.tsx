// src/screens/ProfileSettingsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import * as SecureStore from "expo-secure-store";
import { Picker } from "@react-native-picker/picker";

interface Credential {
  id: string;
  website: "DSBmobile" | "Lanis" | "IServ";
  username: string;
  password: string;
}

interface AppSettings {
  darkMode: boolean;
  experimental: boolean;
  simpleNames: boolean;
  groupClasses: boolean;
}

const CREDENTIALS_KEY = "app_credentials";
const SETTINGS_KEY = "app_settings";
const CLASS_FILTERS_KEY = "class_filters";

export default function ProfileSettingsScreen() {
  // Credentials state
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [website, setWebsite] = useState<Credential["website"]>("DSBmobile");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    experimental: false,
    simpleNames: true,
    groupClasses: true,
  });

  // Class filter state
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [newClassFilter, setNewClassFilter] = useState(""); 

  // Load credentials, settings, and classFilter on mount
  useEffect(() => {
    (async () => {
      try {
        const credData = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (credData) setCredentials(JSON.parse(credData));

        const settingsData = await SecureStore.getItemAsync(SETTINGS_KEY);
        if (settingsData) setSettings(JSON.parse(settingsData));

        const filterData = await SecureStore.getItemAsync(CLASS_FILTERS_KEY);
        if (filterData) setClassFilters(JSON.parse(filterData));
      } catch (e) {
        console.error(
          "--- FEHLER: Daten konnten nicht geladen werden ---\n",
          e
        );
      }
    })();
  }, []);

  // Persist credentials on change
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync(
          CREDENTIALS_KEY,
          JSON.stringify(credentials)
        );
      } catch (e) {
        console.error(
          "--- FEHLER: Credentials konnten nicht gespeichert werden ---\n",
          e
        );
      }
    })();
  }, [credentials]);

  // Persist settings on change
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error(
          "--- FEHLER: Einstellungen konnten nicht gespeichert werden ---\n",
          e
        );
      }
    })();
  }, [settings]);

  // Persist classFilter on change
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync(
          CLASS_FILTERS_KEY,
          JSON.stringify(classFilters)
        );
      } catch (e) {
        console.error(
          "--- FEHLER: Klassenfilter konnte nicht gespeichert werden ---\n",
          e
        );
      }
    })();
  }, [classFilters]);

  // Credential handlers
  const handleAddCredential = () => {
    if (!username || !password) {
      Alert.alert(
        "Benutzername und Passwort werden benötigt",
        "Bitte geben Sie sowohl einen Benutzernamen als auch ein Passwort ein."
      );
      return;
    }
    const newCred: Credential = {
      id: Date.now().toString(),
      website,
      username,
      password,
    };
    setCredentials((prev) => [newCred, ...prev]);
    setUsername("");
    setPassword("");
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  // Settings handlers
  const toggleSetting = (key: keyof AppSettings) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };


  const handleAddFilter = () => {
    const f = newClassFilter.trim();
    if (f && !classFilters.includes(f)) {
      setClassFilters([...classFilters, f]);
    }
    setNewClassFilter("");
  };

  const handleRemoveFilter = (filter: string) => {
    setClassFilters(classFilters.filter((f) => f !== filter));
  };

  return (
    <ScrollView
      style={[styles.container, settings.darkMode && styles.darkContainer]}
    >
      <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
        Zugangsdaten verwalten
      </Text>
      <View style={styles.pickerContainer}>
        <Text style={settings.darkMode && styles.darkText}>Plattform</Text>
        <Picker
          selectedValue={website}
          style={[styles.picker, settings.darkMode && styles.darkPicker]}
          onValueChange={setWebsite}
        >
          <Picker.Item label="DSBmobile" value="DSBmobile" />
          <Picker.Item label="Lanis" value="Lanis" />
          <Picker.Item label="IServ" value="IServ" />
        </Picker>
      </View>
      <TextInput
        placeholder="Benutzername"
        placeholderTextColor={settings.darkMode ? "#aaa" : "#666"}
        value={username}
        onChangeText={setUsername}
        style={[styles.input, settings.darkMode && styles.darkInput]}
      />
      <TextInput
        placeholder="Passwort"
        placeholderTextColor={settings.darkMode ? "#aaa" : "#666"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, settings.darkMode && styles.darkInput]}
      />
      <TouchableOpacity onPress={handleAddCredential}>
        <Text style={styles.addButtonText}>Login hinzufügen</Text>
      </TouchableOpacity>

      <FlatList
        data={credentials}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.item, settings.darkMode && styles.darkItem]}>
            <View style={{ flex: 1 }}>
              <Text style={settings.darkMode && styles.darkText}>
                {item.website}
              </Text>
              <Text style={settings.darkMode && styles.darkText}>
                {item.username}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteCredential(item.id)}
              style={styles.addButton}
            >
              <Text style={styles.delete}>Löschen</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text
        style={[
          styles.sectionTitle,
          styles.settingsTitle,
          settings.darkMode && styles.darkText,
        ]}
      >
        App-Einstellungen
      </Text>
      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>Dark Mode</Text>
        <Switch
          value={settings.darkMode}
          onValueChange={toggleSetting("darkMode")}
        />
      </View>

      <Text
        style={[
          styles.sectionTitle,
          styles.settingsTitle,
          settings.darkMode && styles.darkText,
        ]}
      >
        Vertretungsplan
      </Text>

      <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
        Standardfilter
      </Text>

      <View style={styles.filterInputRow}>
        <TextInput
          style={[
            styles.input,
            settings.darkMode && styles.darkInput,
            { flex: 1 },
          ]}
          placeholder="Neue Klasse"
          placeholderTextColor={settings.darkMode ? "#aaa" : "#666"}
          value={newClassFilter}
          onChangeText={setNewClassFilter}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddFilter}>
          <Text style={styles.addButtonText}>Hinzufügen</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={classFilters}
        horizontal
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveFilter(item)}>
              <FontAwesome name="trash" size={16} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>
          Experimentelle Funktionen
        </Text>
        <Switch
          value={settings.experimental}
          onValueChange={toggleSetting("experimental")}
        />
      </View>

      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>Einfache Namen</Text>
        <Switch
          value={settings.simpleNames}
          onValueChange={toggleSetting("simpleNames")}
        />
      </View>

      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>
          Gruppierung von Klassen
        </Text>
        <Switch
          value={settings.groupClasses}
          onValueChange={toggleSetting("groupClasses")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#222" },
  sectionTitle: { fontSize: 20, marginVertical: 12, fontWeight: "600" },
  settingsTitle: { marginTop: 24 },
  pickerContainer: { marginBottom: 8 },
  picker: { height: 50, width: "100%" },
  darkPicker: {},
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    color: "#000",
  },
  darkInput: { borderColor: "#555", color: "#fff" },
  list: { marginTop: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  darkItem: { borderColor: "#444" },
  delete: { color: "red", marginLeft: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  darkText: { color: "#fff" },
  filterInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  filterList: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
  },
  removeText: {
    marginLeft: 6,
    fontSize: 16,
    color: "red",
  },
  addButton: {
    backgroundColor: "#4F6D7A",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
