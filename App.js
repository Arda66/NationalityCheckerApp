import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
const BaseURL = 'https://api.nationalize.io/?name=';

const App = () => {
  var lookup = require('country-data').lookup;
  const [searchText, setSearchText] = useState('');
  const [result, setResult] = useState('');
  let tempText;
  let finalText = ' ';

  const getData = async () => {
    if (searchText.length > 0) {
      try {
        const response = await axios.get(`${BaseURL}${searchText}`);
        const length = response.data.country.length;
        for (let i = 0; i < length; i++) {
          //rearrange the data
          if (
            lookup.countries({
              alpha2: response.data.country[i].country_id,
            }).length > 0
          ) {
            tempText = {
              country: lookup.countries({
                alpha2: response.data.country[i].country_id,
              })[0].name,
              probability:
                (response.data.country[i].probability * 100).toFixed(1) + '%',
            };
          } else {
            continue;
          }

          finalText =
            finalText +
            '->\t ' +
            tempText.country +
            '\t  ' +
            tempText.probability +
            '\n ';
        }
        setResult(
          `\tname : ${searchText}\n\t\t\t\t` +
            'Nationality Results!\n' +
            finalText,
        );
        console.log(finalText);
        setSearchText('');
      } catch (error) {
        console.log(error);
      }
    } else Alert.alert('Your field is empty!', 'Please enter a name');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e6d5c3',
      }}>
      <ScrollView
        style={{
          flex: 1,
          width: '95%',
          elevation: 3,
          padding: 5,
          marginVertical: 10,
        }}>
        <Text
          onLongPress={() => {
            Alert.alert(
              'Copy',
              'Do you want to copy the result?',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    Clipboard.setString(result);
                    Alert.alert('Copied!');
                  },
                },
              ],
              {cancelable: false},
            );
          }}
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 22,
            letterSpacing: 1,
            lineHeight: 50,
          }}>
          {result}
        </Text>
      </ScrollView>
      <KeyboardAvoidingView
        style={{
          flex: 0.8,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
        <TextInput
          style={{
            width: '85%',
            borderColor: '#7ba6db',
            opacity: 0.9,
            borderWidth: 2,
            borderRadius: 12,
            bottom: '25%',
            color: 'black',
          }}
          placeholder="Enter your name..."
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />
        <TouchableOpacity
          style={{
            height: 75,
            width: 100,
            borderRadius: 20,
            backgroundColor: '#afd1fa',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
            bottom: '17%',
          }}
          onPress={() => {
            getData();
            Keyboard.dismiss();
          }}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 22,
              top: '5%',
            }}>
            Search
          </Text>
          <FontAwesomeIcon
            style={{margin: 10, bottom: '5%'}}
            name="search"
            size={28}
            color="black"
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
