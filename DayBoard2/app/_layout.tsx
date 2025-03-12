import { Stack, Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { View, Text } from "react-native";
import React from "react";

export default function RootLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="index"
            options={{
               title: 'Home',
               tabBarIcon: ({ color }) => <FontAwesome size={25} name="home" color={color} />
            }}
         />
         <Tabs.Screen
            name="aufgaben"
            options={{
               title: 'Aufgaben',
               tabBarIcon: ({ color }) => <FontAwesome size={25} name="check" color={color} />
            }}
         />
         <Tabs.Screen
            name="Stundenplan"
            options={{
               title: 'Stundenplan',
               tabBarIcon: ({ color }) => <FontAwesome size={25} name="calendar" color={color} />
            }}
         />
         <Tabs.Screen
            name="profile"
            options={{
               title: 'Profil',
               tabBarIcon: ({ color }) => <FontAwesome size={25} name="user" color={color} />
            }}
         />
      </Tabs>
   );
}