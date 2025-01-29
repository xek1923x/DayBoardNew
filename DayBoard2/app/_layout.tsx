import { Stack, Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text} from "react-native";

export default function RootLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="index"
            options={{
               title: 'Home',
               tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
            }}
         />
         <Tabs.Screen
            name="aufgaben"
            options={{
               title: 'Aufgaben',
               tabBarIcon: ({ color }) => <FontAwesome size={25} name="list-ul" color={color} />,
            }}
         />
         <Tabs.Screen
            name="stundenplan"
            options={{
               title: 'Stundenplan',
               tabBarIcon: ({ color }) => <FontAwesome size={22} name="calendar" color={color} />,
            }}
         />
         <Tabs.Screen
            name="profile"
            options={{
               title: 'Profil',
               tabBarIcon: ({ color }) => <FontAwesome size={25} name="user" color={color} />,
            }}
         />
      </Tabs>
   );
}