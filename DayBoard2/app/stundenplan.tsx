import { View, Text, StyleSheet, TextInput, Button, ScrollView} from 'react-native';
import { useState, useEffect } from 'react';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [text, onTextChange] = useState('');


  const state = {
    tableHead: ['Datum', 'Art', 'Klasse', 'Stunde','Fach','Lehrer']
  }

  const fetchPost = async (text4 :string) => {
    const response = await fetch(
       'https://dsb-app-363581125799.europe-west3.run.app/entries?class=' + text4
    );
    const data = await response.json();
    console.log(data);
    setPosts(data);
  };

  // GET with fetch API
  useEffect(() => {
     fetchPost(text);
  }, []);

  return(
 
    <View style={styles.container}>
      <Text>Klasse/Lehrerkürzel</Text>
      <TextInput
          style={styles.input}
          onChangeText={ (text2) => {onTextChange(text2); fetchPost(text2)}}
          value={text}
        />
        <Button
          onPress={fetchPost(text)}
          title="Vertretungsplan laden"
        />
        
        <Table borderStyle={{borderColor: 'transparent'}}>
        
          <Row data={state.tableHead} style={styles.head} textStyle={styles.text}/>
          <ScrollView>
          {
            posts.map(rowData => (
             
              <TableWrapper key="test" style={styles.row}>                  
                    <Cell data={rowData.date} textStyle={styles.text}/>
                    <Cell data={rowData.type} textStyle={styles.text}/>
                    <Cell data={rowData.class} textStyle={styles.text}/>
                    <Cell data={rowData.lesson} textStyle={styles.text}/>
                    <Cell data={rowData.subject} textStyle={styles.text}/>
                    <Cell data={rowData.old_teacher} textStyle={styles.text}/>
              </TableWrapper>
             
            ))
          }
         </ScrollView>
        </Table>
        
      </View>
     
    );
}

export default App

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#808B97' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
  btn: { width: 58, height: 18, backgroundColor: '#78B7BB',  borderRadius: 2 },
  btnText: { textAlign: 'center', color: '#fff' },
  input: { height: 40, margin: 12, borderWidth: 1, padding: 10}
});
