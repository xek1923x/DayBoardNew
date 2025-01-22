import { Stack, Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesomeIcon';
import { View, Text} from "react-native";

export default function RootLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="index"
            options={{
               title: 'Home',
               tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
            }}
         />
         <Tabs.Screen
            name="aufgaben"
            options={{
               title: 'Aufgaben',
               tabBarIcon: ({ color }) => <FontAwesomeIcon icon="fa-solid fa-list-check" />
            }}
         />
         <Tabs.Screen
            name="stundenplan"
            options={{
               title: 'Stundenplan',
               tabBarIcon: ({ color }) => <FontAwesomeIcon icon="fa-solid fa-calendar" />
            }}
         />
         <Tabs.Screen
            name="profile"
            options={{
               title: 'Profil',
               tabBarIcon: ({ color }) => <FontAwesomeIcon icon="fa-solid fa-user" />
            }}
         />
      </Tabs>
   );
}