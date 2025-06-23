// src/screens/ProfileSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';

interface Credential {
  id: string;
  website: 'DSBmobile' | 'Lanis' | 'IServ';
  username: string;
  password: string;
}

interface AppSettings {
  darkMode: boolean;
  experimental: boolean;
}

const CREDENTIALS_KEY = 'app_credentials';
const SETTINGS_KEY = 'app_settings';

export default function ProfileSettingsScreen() {
  // Credentials state
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [website, setWebsite] = useState<Credential['website']>('DSBmobile');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    experimental: false,
  });

  // Load both on mount
  useEffect(() => {
    (async () => {
      try {
        const credData = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (credData) setCredentials(JSON.parse(credData));
        const settingsData = await SecureStore.getItemAsync(SETTINGS_KEY);
        if (settingsData) setSettings(JSON.parse(settingsData));
      } catch (e) {
        console.error('Load data error', e);
      }
    })();
  }, []);

  // Persist credentials and settings on change
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials));
      } catch (e) {
        console.error('Save credentials error', e);
      }
    })();
  }, [credentials]);

  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Save settings error', e);
      }
    })();
  }, [settings]);

  // Credential handlers
  const handleAddCredential = () => {
    if (!username || !password) {
      Alert.alert('Username and password are required');
      return;
    }
    const newCred: Credential = { id: Date.now().toString(), website, username, password };
    setCredentials(prev => [newCred, ...prev]);
    setUsername('');
    setPassword('');
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  // Settings handlers
  const toggleSetting = (key: keyof AppSettings) => (value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Manage Credentials</Text>
      <View style={styles.pickerContainer}>
        <Text style={settings.darkMode && styles.darkText}>Website</Text>
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
        placeholder="Username"
        placeholderTextColor={settings.darkMode ? '#aaa' : '#666'}
        value={username}
        onChangeText={setUsername}
        style={[styles.input, settings.darkMode && styles.darkInput]}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={settings.darkMode ? '#aaa' : '#666'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, settings.darkMode && styles.darkInput]}
      />
      <Button title="Add Credential" onPress={handleAddCredential} />
      <FlatList
        data={credentials}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.item, settings.darkMode && styles.darkItem]}>
            <View style={{ flex: 1 }}>
              <Text style={settings.darkMode && styles.darkText}>{item.website}</Text>
              <Text style={settings.darkMode && styles.darkText}>{item.username}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteCredential(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={[styles.sectionTitle, styles.settingsTitle, settings.darkMode && styles.darkText]}>App Settings</Text>
      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>Dark Mode</Text>
        <Switch value={settings.darkMode} onValueChange={toggleSetting('darkMode')} />
      </View>
      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>Experimental Settings</Text>
        <Switch value={settings.experimental} onValueChange={toggleSetting('experimental')} />
      </View>
      <View style={styles.row}>
        <Text style={settings.darkMode && styles.darkText}>Experimental Settings</Text>
        <Switch value={settings.experimental} onValueChange={toggleSetting('experimental')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#222' },
  sectionTitle: { fontSize: 20, marginVertical: 12, fontWeight: '600' },
  settingsTitle: { marginTop: 24 },
  pickerContainer: { marginBottom: 8 },
  picker: { height: 50, width: '100%' },
  darkPicker: {},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    color: '#000',
  },
  darkInput: { borderColor: '#555', color: '#fff' },
  list: { marginTop: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  darkItem: { borderColor: '#444' },
  delete: { color: 'red', marginLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  darkText: { color: '#fff' },
});

