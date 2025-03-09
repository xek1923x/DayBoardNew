import { View, Modal, Keyboard, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from "react";

export default function Aufgaben() {
    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                }}
                keyboardShouldPersistTaps='handled'>

                
                <View style={styles.tasksWrapper}>
                    <Text style={styles.sectionTitle}>Aufgaben von heute</Text>
                    <ScrollView style={styles.items}>
                    
                        <Task text={"Task 1"} /> 
                        <Task text={"Task 2"} />
                        <Task text={"Task 2"} />
                        <Task text={"Task 2"} /> 
                        
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    )
}

type TaskProps = {
    text: string;
};

export function Task({ text }: TaskProps) {
    return (
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={styles.square}></View>
            <Text style={styles.itemText}>{text}</Text>
          </View>
          <View style={styles.circular}></View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8EAED',
    },
    tasksWrapper: {
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        paddingBottom: 15,
        fontSize: 24,
        fontWeight: 'bold',
    },
    items: {},
    item: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    square: {
        width: 24,
        height: 24,
        backgroundColor: '#55BCF6',
        opacity: 0.4,
        borderRadius: 5,
        marginRight: 15,
    },
    itemText: {
        maxWidth: '80%',
    },
    circular: {
        width: 12,
        height: 12,
        borderColor: '#55BCF6',
        borderWidth: 2,
        borderRadius: 5,
    },
});