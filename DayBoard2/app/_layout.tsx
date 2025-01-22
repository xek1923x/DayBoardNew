import { Stack, Tabs } from "expo-router";
import { View, Text} from "react-native";

export default function RootLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="index"
            options={{
               title: 'Home',
            }}
         />
         <Tabs.Screen
            name="aufgaben"
            options={{
               title: 'Aufgaben',
            }}
         />
      </Tabs>
   );
}