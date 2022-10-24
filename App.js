import React, {useRef, useState, useEffect} from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import EntypoIcon from 'react-native-vector-icons/Entypo';
const BaseURL = 'https://api.nationalize.io/?name=';

const App = () => {
  var lookup = require('country-data').lookup;
  const [searchText, setSearchText] = useState('');
  const [ShareResult, setShareResult] = useState('');
  const [ProgressBars, setProgressBars] = useState([]);
  const [HeaderText, setHeaderText] = useState('');
  let tempText;
  let finalText = ' ';
  let [text_array, setText_array] = useState([]);
  const ProgressBarArray = [];
  const localInputRef = useRef < null || TextInput > null;
  // ctrl + shift + L ile o değişkenin olduğu herşeyi seçebilion
  // width : '50%' vermek text için split yani altından devam et anlamına geliyor
  // terminal üzerinden  code .   yaparsan vs code üzerinden açıyor
  // margin kendi komşularını itmek için kullanılır, padding childları manipule etmek için border içi
  useEffect(() => {
    const keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHideCallback,
    );
    return () => {
      keyboardDidHideSubscription?.remove();
    };
  }, []);
  const keyboardDidHideCallback = () => {
    localInputRef?.current?.blur();
  };
  const getData = async () => {
    if (searchText.length > 0) {
      try {
        const response = await axios.get(`${BaseURL}${searchText}`);
        const length = response.data.country.length;
        ProgressBarArray.splice(0, ProgressBarArray.length);
        setText_array([]);
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
          } else continue;
          finalText =
            finalText +
            '->\t ' +
            tempText.country +
            '\t  ' +
            tempText.probability +
            '  <-' +
            '\n ';
          ProgressBarArray.push(
            Math.round(
              tempText.probability.slice(0, -1) < 10
                ? 1
                : tempText.probability.slice(0, -1) / 10,
            ),
          );
        }
        if (finalText.includes('->') && searchText.length > 1) {
          setShareResult(
            `\tname : ${searchText}\n\t\t\t\t` +
              'Nationality Results!\n' +
              finalText,
          );
          setHeaderText(
            `\tname : ${searchText}\n\t\t\t\t` + 'Nationality Results!\n',
          );
          setProgressBars(ProgressBarArray);
          text_array = finalText.split('<-');
          setText_array(text_array);
        } else {
          setShareResult(
            `\tname : ${searchText}\n\t` +
              'No Results found!\n\tPlease try again.',
          );
          setHeaderText(
            `\tname : ${searchText}\n\n\t` +
              '\t\tNo Results found!\n\t\t\tPlease try again.',
          );
          setProgressBars([]);
        }
        setSearchText('');
      } catch (error) {
        console.log(error);
      }
    } else Alert.alert('Your field is empty!', 'Please enter a name');
  };

  const ShareMessage = () => {
    if (ShareResult.length > 0) {
      const shareOptions = {
        title: 'Share via',
        message: ShareResult,
      };
      Share.open(shareOptions).catch(err => {
        err && console.log(err);
      });
    } else Alert.alert('No data to share!', 'Please enter a name and search');
  };
  const Copy = () => {
    Alert.alert(
      'Copy',
      'Do you want to copy the Result?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Copy',
          onPress: () => {
            Clipboard.setString(ShareResult);
          },
        },
      ],
      {cancelable: false},
    );
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
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          width: '95%',
          elevation: 3,
          marginVertical: 10,
          padding: 5,
          borderWidth: 0.1,
        }}>
        <Text
          style={{
            color: '#211f1f',
            fontWeight: 'bold',
            fontSize: 22,
            letterSpacing: 1,
            lineHeight: 35,
            marginBottom: 5,
            fontFamily: 'Montserrat-Regular',
            textAlign: 'center',
            alignItems: 'center',
            textShadowOffset: {width: 0.8, height: 0.8},
            textShadowRadius: 1,
            textShadowColor: '#000',
            marginRight: '15%',
          }}>
          {HeaderText}
        </Text>
        {ProgressBars.length > 0 &&
          ProgressBars.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  marginVertical: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bottom: '8%',
                  flex: 1,
                }}>
                <Text
                  onLongPress={() => {
                    Copy();
                  }}
                  accessible
                  style={[
                    {
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: 22,
                      letterSpacing: 1,
                      lineHeight: 22,
                      width: '75%',
                      flex: 1,
                      fontFamily: 'Montserrat-SemiBold',
                    },
                    (style = {top: index == 0 ? '2%' : '0%'}),
                  ]}>
                  {text_array[index]}
                </Text>
                <Progress.Bar
                  style={{top: '2%', marginVertical: 5}}
                  progress={item / 10}
                  width={110}
                  height={30}
                  color={'#038cfc'}
                  unfilledColor={'#e6d5c3'}
                  borderColor={'#4d8ec4'}
                  borderWidth={1}
                />
              </View>
            );
          })}
      </ScrollView>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <KeyboardAvoidingView
          style={{
            flex: 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            top: '12%',
          }}>
          <TextInput
            autoCapitalize="none"
            ref={ref => {
              localInputRef && (localInputRef.current = ref);
            }}
            style={{
              width: '85%',
              borderColor: '#7ba6db',
              opacity: 1,
              borderWidth: 2,
              borderRadius: 12,
              bottom: '25%',
              color: 'black',
              marginVertical: 15,
            }}
            placeholder="Enter the name..."
            placeholderTextColor={'gray'}
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              padding: 20,
            }}>
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
                right: '20%',
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
            <TouchableOpacity
              style={{
                height: 75,
                width: 100,
                borderRadius: 20,
                backgroundColor: '#4dc457',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 3,
                bottom: '17%',
                left: '20%',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.8,
                shadowRadius: 2,
              }}
              onPress={() => {
                ShareMessage();
                Keyboard.dismiss();
              }}>
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: 22,
                  top: '5%',
                }}>
                Share
              </Text>
              <EntypoIcon
                style={{margin: 10, bottom: '5%'}}
                name="share"
                size={30}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default React.memo(App);
