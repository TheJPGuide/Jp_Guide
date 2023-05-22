import { View, Text, StatusBar, ImageBackground, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import CustomButton from '../../component/CustomButton'
import colors from '../../constant/colors'
import auth, { firebase } from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'


const Login = ({ navigation }) => {

  const [Email, setEmail] = useState('')
  const [Password, setPassword] = useState('')
  const [Loading, setLoading] = useState(false)


  console.log(Email, Password)

  const handleLogin = async () => {
    const DevToken = await AsyncStorage.getItem("FMCToken")

    setLoading(true)

    const Regix = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


    if (Email == "") {
      Toast.show({
        type: 'error',
        text1: 'Please enter your email',
      });
      setLoading(false)
    } else if (Password == "") {
      Toast.show({
        type: 'error',
        text1: 'Please enter your password',
      });
      setLoading(false)

    } else if (!Email.match(Regix)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid email',
      });
      setLoading(false)

    } else {
      auth()
        .signInWithEmailAndPassword(Email, Password)
        .then(() => {
          console.log('User account created & signed in!');
          setLoading(false)

          const UID = auth()?.currentUser?.uid

          firestore()
            .collection("Users")
            .doc(UID)
            .update({
              DeviceToken: DevToken
            }
            )



        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            Toast.show({
              type: 'error',
              text1: 'That email address is already in use!',
            });

          }

          if (error.code === 'auth/invalid-email') {
            Toast.show({
              type: 'error',
              text1: 'That email address is invalid!',
            });
          }

          if (error.code === 'auth/user-not-found') {
            Toast.show({
              type: 'error',
              text1: 'User not found!',
            });
          }
          setLoading(false)


          console.error(error);
        });
    }

  }
  return (
    <>
      <ImageBackground source={require('../../assets/images/backgroung.png')} resizeMode="cover" style={styles.image}>
        <ScrollView contentContainerStyle={{paddingBottom:400}}  showsVerticalScrollIndicator={false} >
          <View style={{ width: wp('90%'), height: hp('90%'), justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{}}>
              <Image style={{ height: hp('40%'), width: wp('40%') }} source={require('../../assets/images/profile.png')} resizeMode='contain' />
            </View>
            <View style={{ width: wp('75%'), backgroundColor: 'rgba(252, 252, 252, 0.4)', padding: 20, borderRadius: 20 }}>
              <View style={{ width: wp('20'), paddingVertical: 10 }}>
                <Text style={styles.titleText}>Login to your Account</Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  onChangeText={(text) => {
                    setEmail(text)
                  }}
                  value={Email}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  onChangeText={(txt) => {
                    setPassword(txt)
                  }}
                  secureTextEntry
                  value={Password}
                />
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
                <Text style={{ alignSelf: 'flex-end', color: '#fff', fontWeight: 'bold' }}>Forgot password?</Text>
              </TouchableOpacity>
              <CustomButton
                buttonColor={colors.primary}
                title="Login"
                buttonStyle={{ width: '100%', alignSelf: 'center', marginVertical: 10, borderRadius: 10 }}
                textStyle={{ fontSize: 20 }}
                onPress={() => handleLogin()}
                Loading={Loading}
              />
              <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                <View style={[styles.bottmoButtom, { paddingRight: 10 }]}>
                  <Text style={[styles.titleText, { color: colors.white }]}>Don't have an account?</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.5} style={[styles.bottmoButtom, { backgroundColor: colors.secondery, alignItems: 'center', borderRadius: 10 }]}>
                  <Text style={{ fontSize: 20, color: colors.white }}>Create an Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>

      <Toast />

    </>


  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  imageCenter: {
    color: "white",
    fontSize: 42,
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    backgroundColor: '#E9E9E9', marginVertical: 10, height: hp('6'), borderRadius: 10,
    padding: 20
  },
  bottmoButtom: {
    width: wp('35'),
    height: hp('6'),
    justifyContent: 'center'
  },
  titleText: {
    fontSize: 24, color: colors.primary, fontWeight: 'bold'
  }
})
export default Login