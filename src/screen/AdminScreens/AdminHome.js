import { View, Text, ImageBackground, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet, FlatList, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../../constant/colors'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Entypo from 'react-native-vector-icons/Entypo'
import DropDownPicker from 'react-native-dropdown-picker';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../../utils/COLORS'
import AntDesign from 'react-native-vector-icons/AntDesign'
import messaging from '@react-native-firebase/messaging';
import axios from 'axios'

const AdminHome = ({ navigation }) => {


  const array = [
    { id: 1, name: "International Supplement" },
    { id: 2, name: "Communications" },
    { id: 3, name: "General International information" },
    { id: 4, name: "Operational information" },
    { id: 5, name: "General Aircraft Notes And Maintenance" },
  ]

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Domestic', value: 'Domestic' },
    { label: 'WorldWide', value: 'WorldWide' }
  ]);
  const [ImageUrl, setImageUrl] = useState("")
  const [ImageName, setImageName] = useState("")
  const [Loading, setLoading] = useState(false)
  const [allUserTokens, setAllUserTokens] = useState()

  const [data, setData] = useState({
    Code: "",
    CodeDetail: "",
  })

  console.log(allUserTokens)

  useEffect(() => {
    getAllTokens()
  }, [])

  const getAllTokens = () => {
    firestore()
      .collection("Users")
      .get()
      .then((doc) => {
        const temp = []
        // console.log(doc.docs)
        doc.docs.forEach((e) => {
          const allTokens = e.data().DeviceToken
          if (allTokens == null || allTokens == "") {

          } else {

            temp.push(allTokens)
          }
        })

        setAllUserTokens(temp)
      })
  }


  async function pickDocument() {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      })

      // console.log("result....",result)
      setImageUrl(result[0].uri)
      setImageName(result[0].name)

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Error!
      }
    }
  }


  // console.log(value)

  const firstLatter = data.Code.charAt(0).toUpperCase()

  // console.log("latter", firstLatter)

  const saveImage = async () => {

    setLoading(true)

    if (ImageUrl === "") {
      Toast.show({
        type: 'error',
        text1: 'Please select your pdf',
      });


      setLoading(false)

    } else {

      const rand = Math.floor(Math.random() * 1000000000);
      await storage().ref(`${rand}`).putFile(ImageUrl);
      await storage().ref(`${rand}`).getDownloadURL().then((pdfDownloadedUrl) => {


        if (data.Code === "") {
          Toast.show({
            type: 'error',
            text1: 'Please enter your code',
          });
          setLoading(false)
        } else if (data.CodeDetail === "") {
          Toast.show({
            type: 'error',
            text1: 'Please enter your code detail',
          });
          setLoading(false)
        } else {

          firestore()
            .collection("Alphabet")
            .doc(`${firstLatter}`)
            .collection(`${firstLatter}`)
            .doc(data.Code)
            .get()
            .then((doc) => {
              // console.log(doc.exists)

              if (doc.exists === true) {

                firestore()
                  .collection("Alphabet")
                  .doc(`${firstLatter}`)
                  .collection(`${firstLatter}`)
                  .doc(data.Code)
                  .set({
                    Airport: data.Code + data.CodeDetail,
                    Page: pdfDownloadedUrl,
                    name: data.Code,
                    UpdateDownloaded: []
                  }, {
                    merge: true
                  }).then(() => {
                    Toast.show({
                      type: 'success',
                      text1: 'Done',
                    });
                    setLoading(false)
                    sendNotificationToAllUser()
                  })

              } else {
                firestore()
                  .collection("PDF")
                  .add({
                    Airport: data.Code + data.CodeDetail,
                    Page: pdfDownloadedUrl,
                    name: data.Code,
                    UpdateDownloaded: []
                  }, {
                    merge: true
                  }).then(() => {
                    setLoading(false)
                    firestore()
                      .collection("Alphabet")
                      .doc(`${firstLatter}`)
                      .collection(`${firstLatter}`)
                      .doc(data.Code)
                      .set({
                        Airport: data.Code + data.CodeDetail,
                        Page: pdfDownloadedUrl,
                        name: data.Code,
                        UpdateDownloaded: []

                      }, {
                        merge: true
                      })


                  }).then(() => {
                    Toast.show({
                      type: 'success',
                      text1: 'Pdf Succesfully Uploaded',
                    });
                    sendNotificationToAllUser()
                    setLoading(false)
                  })
              }

            })

          // return

          //getting data first


        }
      })
        .catch((err) => {
          console.log("Error: " + err)
        })

    }
  }

  // const sendNotification = async () => {


  //   console.log("dasdsadsad running")

  //   let data = JSON.stringify({
  //     "to": "dPBdQyn92UgZrLgaULLye0:APA91bG_6Xka38trlk4663plqK9dgd_7OLOEb0RvyhWzjFZ9uW8SktogQvUbrEC3k-o4U5mfcas9sUfHR_d4-SsZptpxrDe6B6EMMiHX_4Hjm__TcNfhpOpJlYpKui6supCi-GeTSeTQ",
  //     "notification": {
  //       "title": "Jp Guide",
  //       "body": "Pdf Uploaded"
  //     },
  //     "data": {}
  //   });

  //   let config = {
  //     method: 'post',
  //     maxBodyLength: Infinity,
  //     url: 'https://fcm.googleapis.com/fcm/send',
  //     headers: { 
  //       'Authorization': 'key=AAAAI5_iRy4:APA91bG-265vdefp_ZxCgghvYa6L-xUgDHCHqhsPv9GXCho4J5caCx2dQxPjn9bkz89rdml9l70a16re1VANIJM9xC6fFZbko86cgfjZz1DZhq09RuGsClnybu-w0xnO6AYta_5etZK8', 
  //       'Content-Type': 'application/json'
  //     },
  //     data : data
  //   };

  //   axios.request(config)
  //   .then((response) => {
  //     console.log(JSON.stringify(response.data));
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });



  // }


  //on working
  const sendNotificationToAllUser = () => {
    const datas = JSON.stringify({
      "fcmToken": allUserTokens,
      "message": data.Code + " Pdf Updated"
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://jpguidenotification-9a79be001093.herokuapp.com/sendNotifications',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: datas
    };


    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });

  }
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => { navigation.navigate('EditMainPdf', { pdfname: item.name }) }} style={styles.EditContainer}>
        <AntDesign
          name='edit'
          size={25}
          color={COLORS.WHITE}
          style={{ alignSelf: 'flex-end' }}
        />
        <Text style={styles.TextStyle}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ImageBackground source={require('../../assets/images/hi.jpeg')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }} resizeMode={'cover'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 300 }} showsVerticalScrollIndicator={false}>
          {/* 
          {
            //I'll delete this pdf button in future
            <TouchableOpacity onPress={() => sendNotificationToAllUser()} style={{ height: 50, width: wp('30%'), backgroundColor: colors.primary, alignSelf: 'flex-end', borderRadius: 200, marginRight: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Text style={{ color: COLORS.WHITE, fontWeight: 'bold', fontSize: hp('2%') }}>Noti all user of the app</Text>
            </TouchableOpacity>
          } */}

          <View style={{flexDirection:'row', justifyContent:'space-between'}}>

          <TouchableOpacity onPress={() => navigation.navigate('AllNotes')} style={{ height: 50, width: wp('30%'), backgroundColor: colors.primary, alignSelf: 'flex-end', borderRadius: 200, marginRight: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Text style={{ color: COLORS.WHITE, fontWeight: 'bold', fontSize: hp('2%') }}>NOTES</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AllPdf')} style={{ height: 50, width: wp('30%'), backgroundColor: colors.primary, alignSelf: 'flex-end', borderRadius: 200, marginRight: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Text style={{ color: COLORS.WHITE, fontWeight: 'bold', fontSize: hp('2%') }}>Customize PDF</Text>
          </TouchableOpacity>

          </View>

          <View style={{ backgroundColor: colors.primary, width: wp('90'), alignSelf: 'center', borderRadius: 20, top: 10, marginBottom: 30, alignItems: 'center', justifyContent: 'center' }}>

            <Text style={{ color: COLORS.WHITE, alignSelf: 'center', fontSize: hp('2.5%'), fontWeight: 'bold', marginTop: 20 }}>Upload pdf</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', width: wp('80%'), justifyContent: 'space-between', marginTop: 20, marginBottom: 20 }}>

              <TextInput
                placeholder='Code AUA / etc'
                placeholderTextColor={"gray"}
                style={{ height: 60, backgroundColor: COLORS.WHITE, borderRadius: 10, paddingHorizontal: 10, width: wp('25%') }}
                onChangeText={(txt) => {
                  setData({ ...data, Code: txt });

                }}
                value={data.Code}
              />

              <TextInput
                placeholder='(St. Johns, Antigua)'
                placeholderTextColor={"gray"}
                style={{ height: 60, backgroundColor: COLORS.WHITE, borderRadius: 10, paddingHorizontal: 10, width: wp('50%') }}
                onChangeText={(txt) => {
                  setData({ ...data, CodeDetail: txt });
                }}
                value={data.CodeDetail}
              />

            </View>


            <TouchableOpacity onPress={() => pickDocument()} style={{ height: hp('10%'), width: wp('30%'), backgroundColor: COLORS.WHITE, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              {
                ImageUrl !== "" ?

                  <Text>
                    {ImageName}
                  </Text>

                  :
                  <>
                    <Entypo
                      name='plus'
                      size={hp('5%')}
                      color={'black'}
                    />

                    <Text style={{ fontSize: hp('2%') }}>upload pdf</Text>
                  </>

              }


            </TouchableOpacity>



            <TouchableOpacity onPress={() => saveImage()} style={{ height: 60, width: wp("80%"), backgroundColor: colors.secondery, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: 20 }}>
              <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: hp('2%') }}>{Loading === true ? <ActivityIndicator size={'small'} color={COLORS.WHITE} /> : "Upload"}</Text>
            </TouchableOpacity>

          </View>


          <View >

            <FlatList
              data={array}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ width: wp('90%') }}
              ItemSeparatorComponent={() => <View style={{ marginTop: 10 }} />}
            />

          </View>

          <TouchableOpacity onPress={() => auth()?.signOut()} style={{ height: 60, width: wp("80%"), backgroundColor: colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: 20, alignSelf: 'center', }}>
            <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: hp('2%') }}>{"Logout"}</Text>
          </TouchableOpacity>

        </ScrollView>
      </ImageBackground>




      <Toast />
    </>

  )
}

const styles = StyleSheet.create({

  EditContainer: {

    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  TextStyle: {
    color: COLORS.WHITE,
    fontSize: hp('2%'),
    textAlign: 'center'
  }

})

export default AdminHome