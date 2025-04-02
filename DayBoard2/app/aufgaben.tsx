import { SafeAreaView, View, Modal, Keyboard, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from "react";
import { endAsyncEvent } from 'react-native/Libraries/Performance/Systrace';
import { buildUnavailableHoursBlocks } from 'react-native-calendars/src/timeline/Packer';

export default function Aufgaben() {
    const [showModal, setshowModal] = useState(false);
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
                        <Task text={"Task 3"} />
                        <Task text={"Task 4"} /> 
                        
                    </ScrollView>
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.plusIcon} onPress={() => setshowModal(!showModal)}>
                <FontAwesome name="plus-circle" size={60} color="black" />
            </TouchableOpacity>
            <Modal visible={showModal} animationType='slide' presentationStyle='pageSheet' style={styles.centeredView}>
                <SafeAreaView>
                    <View>
                        <TouchableOpacity onPress={() => setshowModal(!showModal)} style={styles.buttonClose}>
                            <Text style={{color: 'mediumblue', margin: 20, fontSize: 17.5}}>Close</Text>
                        </TouchableOpacity>
                    </View> 
                </SafeAreaView>
            </Modal>
        </View>
    )
}

type TaskProps = {
    text: string;
};

export function Task({ text }: TaskProps) {
    const [iconVisible, setIconVisible] = useState(false);
    return (
        <TouchableOpacity onPress={() => setIconVisible(!iconVisible)}>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View>
                <TouchableOpacity style={styles.square} onPress={() => setIconVisible(!iconVisible)}>
                    {iconVisible ? <Ionicons name="checkmark" size={24} color="black" /> : null}
                </TouchableOpacity>
            </View>
            
            <Text style={styles.itemText}>{text}</Text>
          </View>
          <View style={styles.circular}></View>
        </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonClose: {
        color: 'blue',
        visibility: 'visible',

    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
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
    plusIcon: {
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        margin: 20,
        alignSelf: 'flex-end',
    },
});