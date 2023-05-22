import { View, Text, StatusBar, ImageBackground, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import CustomButton from '../../component/CustomButton'
import colors from '../../constant/colors'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo'
import { ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'



const SignUp = ({ navigation }) => {
    const [Email, setEmail] = useState('')
    const [Password, setPassword] = useState('')
    const [userName, setUsername] = useState('')
    const [RetypePassword, setRetypePassword] = useState('')
    const [Check, setCheck] = useState(false)
    const [deviceToken, setDeviceToken] = useState("")

    const [Loading, setLoading] = useState(false)


    useEffect(() => {
        getToken()
    }, [])

    const getToken = async () => {
        const DevToken = await AsyncStorage.getItem("FMCToken")
        setDeviceToken(DevToken)
    }


    // console.log("ddddd Tokennn",deviceToken)


    const handleLogin = () => {
        setLoading(true)
        const Regix = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (Email == "") {
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Please enter your email',
            });
        } else if (Password == "") {
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Please enter your password',
            });
        } else if (!Email.match(Regix)) {
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Please enter a valid email',
            });
        } else if (Password != RetypePassword) {
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Your password is not matched',
            });
        }
        else {


            auth()
                .createUserWithEmailAndPassword(Email, Password)
                .then(() => {
                    console.log('User account created & signed in!');
                    const UID = auth()?.currentUser?.uid

                    firestore()
                        .collection('Users')
                        .doc(UID)
                        .set({
                            Email: Email,
                            username: userName,
                            Buy: "",
                            DeviceToken: deviceToken,
                            status: "User"
                        }).then(() => {
                            setLoading(false)
                        }).catch((err) => {
                            setLoading(false)
                        })
                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        setLoading(false)
                        console.log('That email address is already in use!');
                        Toast.show({
                            type: 'error',
                            text1: 'That email address is already in use!',
                        });
                    }

                    if (error.code === 'auth/invalid-email') {
                        setLoading(false)
                        console.log('That email address is invalid!');
                        Toast.show({
                            type: 'error',
                            text1: 'That email address is invalid!',
                        });
                    }

                    console.error(error);
                    setLoading(false)
                });
        }
    }

    return (
        <ImageBackground source={require('../../assets/images/backgroung.png')} resizeMode="cover" style={styles.image}>
            <StatusBar
                animated={true}
                backgroundColor="transparent"
                translucent={true} />
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 350 }} showsVerticalScrollIndicator={false} >
                <View style={styles.container}>

                    <View style={{ width: wp('90%'), height: hp('90%'), justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Image style={{ height: hp('30%'), width: wp('30%') }} source={require('../../assets/images/profile.png')} resizeMode='contain' />
                        </View>
                        <View style={{ width: wp('75%'), backgroundColor: 'rgba(252, 252, 252, 0.4)', padding: 20, borderRadius: 20 }}>
                            <View style={{ width: wp('20'), paddingVertical: 10 }}>
                                <Text style={styles.titleText}>Sign Up</Text>
                            </View>



                            <View style={{ marginTop: 10 }}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Username"
                                    onChangeText={(text) => {
                                        setUsername(text)
                                    }}
                                    value={userName}
                                />
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
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Re-Type Password"
                                    onChangeText={(txt) => {
                                        setRetypePassword(txt)
                                    }}
                                    secureTextEntry
                                    value={RetypePassword}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => setCheck(true)} style={{ height: 25, width: 25, borderRadius: 6, borderWidth: 2, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    {
                                        Check ?
                                            <View style={{ height: 25, width: 25, backgroundColor: 'black', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                                                <Entypo name='check' size={15} color={'white'} />
                                            </View>

                                            :

                                            null
                                    }
                                </TouchableOpacity>
                                <Text onPress={() => setCheck(true)} style={{ color: 'black', marginLeft: 5, fontSize: hp('1.4%') }}>Please Accept the <Text onPress={() => navigation.navigate('PrivacyPolicy')} style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: 'blue' }}>Privacy Policy</Text></Text>
                            </View>


                            <CustomButton
                                buttonColor={colors.primary}
                                title={Loading === true ? <ActivityIndicator size={'large'} /> : "Sign Up"}
                                buttonStyle={{ width: '100%', alignSelf: 'center', marginVertical: 10, borderRadius: 10 }}
                                textStyle={{ fontSize: 20 }}
                                onPress={() => handleLogin()}
                            />
                            <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.bottmoButtom, { paddingRight: 10 }]}>
                                    <Text style={[styles.titleText, { color: colors.white }]}>Already have an account?</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <Toast />
        </ImageBackground>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageCenter: {
        color: "white",
        fontSize: 42,
        lineHeight: 84,
        fontWeight: "bold",
        textAlign: "center"
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
export default SignUp