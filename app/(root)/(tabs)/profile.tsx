// import InputField from "@/components/InputField";
import { useGetUser } from "@/hooks/getUser";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/config/FirebaseConfig";
// import { doc } from "firebase/firestore";
import Camera from "react-native-vector-icons/AntDesign";
import Lock from "react-native-vector-icons/AntDesign";
import Settings from "react-native-vector-icons/AntDesign";
import Exception1 from "react-native-vector-icons/AntDesign";
import Close from "react-native-vector-icons/AntDesign";
import Calendar from "react-native-vector-icons/AntDesign";
import MonitorDashboard from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "@/components/Modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import Eye from "react-native-vector-icons/Ionicons";
import EyeOff from "react-native-vector-icons/Ionicons";
import { useAuth } from "@clerk/clerk-expo";

const Profile = () => {
  const { userData } = useGetUser();
  const { signOut } = useAuth();
  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };
  const router = useRouter();
  const [image, setImage] = useState<string | null>(userData?.profile || null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModelOpen, setPasswordModalOpen] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);

  if (!userData) return null;

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;

        // Create a unique file name based on the current timestamp
        const fileName = Date.now().toString() + ".jpg";

        // Fetch the image as a blob
        const response = await fetch(selectedImageUri);
        const blob = await response.blob();

        // Create a reference to the Firebase Storage location
        const imageRef = ref(storage, `profile/${fileName}`);

        // Upload the image blob to Firebase Storage
        const snapshot = await uploadBytes(imageRef, blob);

        // Get the download URL for the uploaded image
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update the image state
        setImage(downloadURL);

        const q = query(
          collection(db, "Users"),
          where("clerkId", "==", userData.clerkId),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("No matching document found.");
          return;
        }

        let documentId;
        querySnapshot.forEach((doc) => {
          documentId = doc.id; // Assuming there's only one document with this clerkId
        });

        if (documentId) {
          const userRef = doc(db, "Users", documentId);
          await updateDoc(userRef, {
            profile: downloadURL,
          });

          ToastAndroid.show(
            "Profile updated successfully!",
            ToastAndroid.SHORT,
          );

          router.push("/profile");
        } else {
          console.error("Document ID not found.");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = ({ type }: any, selectedDate: any) => {
    if (type === "set") {
      const currentDate = selectedDate;
      setDate(currentDate);
      if (Platform.OS === "android") {
        toggleDatePicker();
        setBirthdate(formatDateToDDMMYYYY(currentDate));
      }
    } else {
      toggleDatePicker();
    }
  };

  const submitBirthdate = async () => {
    try {
      if (!userData) return;

      const q = query(
        collection(db, "Users"),
        where("clerkId", "==", userData.clerkId),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No matching document found.");
        return;
      }

      let documentId;
      querySnapshot.forEach((doc) => {
        documentId = doc.id; // Assuming there's only one document with this clerkId
      });

      if (documentId) {
        const userRef = doc(db, "Users", documentId);
        await updateDoc(userRef, {
          birthday: birthdate,
        });

        userData.birthday = birthdate;
        ToastAndroid.show("Birthday updated successfully!", ToastAndroid.SHORT);
        setModalOpen(false);
        router.push("/profile");
      } else {
        console.error("Document ID not found.");
      }
    } catch (error) {
      console.error("Error updating birthdate:", error);
    }
  };

  const submitPassword = async () => {
    if (newPassword !== confirmPassword) {
      ToastAndroid.show("Passwords do not match!", ToastAndroid.SHORT);
      return;
    }

    try {
      if (!userData) return;
      // clerk auth handler
      // await signIn?.resetPassword(userData?.password);
      const q = query(
        collection(db, "Users"),
        where("clerkId", "==", userData.clerkId),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.error("No matching document found.");
        return;
      }
      let documentId;
      querySnapshot.forEach((doc) => {
        documentId = doc.id; // Assuming there's only one document with this clerkId
      });
      if (documentId) {
        const userRef = doc(db, "Users", documentId);
        await updateDoc(userRef, {
          password: confirmPassword,
        });
        ToastAndroid.show("Password updated successfully!", ToastAndroid.SHORT);
        setPasswordModalOpen(false);
        router.push("/profile");
      } else {
        console.error("Document ID not found.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white h-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="bg-primary py-5 pb-28 rounded-b-[100px]">
          <View className="flex items-center justify-center relative my-5">
            {image ? (
              <>
                <Image
                  source={{ uri: image }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  className="rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
                />
                <TouchableOpacity
                  className="absolute bottom-0 z-10 right-[130px] bg-white rounded-full p-2"
                  style={{ elevation: 3 }}
                  onPress={handleImagePick}
                >
                  <Camera name="camera" color="#5e7119" size={20} />
                </TouchableOpacity>
              </>
            ) : userData.profile ? (
              <>
                <Image
                  source={{ uri: userData.profile }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  className="rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
                />
                <TouchableOpacity
                  className="absolute bottom-0 z-10 right-[130px] bg-white rounded-full p-2"
                  style={{ elevation: 3 }}
                  onPress={handleImagePick}
                >
                  <Camera name="camera" color="#5e7119" size={20} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="rounded-full relative m-auto h-[100px] item-center justify-center w-[100px] p-5 border-4 bg-zinc-100 border-primary">
                  <Text className="text-center font-bold text-4xl">
                    {userData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  className="absolute bottom-0 right-[130px] bg-white rounded-full p-2"
                  style={{ elevation: 3, marginLeft: 20 }}
                  onPress={handleImagePick}
                >
                  <Camera name="camera" color="#5e7119" size={20} />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View className="items-center justify-center">
            <Text className="font-bold text-lg text-white">
              {userData.name}
            </Text>
            <Text className="text-sm text-zinc-200">{userData.email}</Text>
          </View>
        </View>
        <View
          className="bg-white -mt-20 p-5 rounded-lg w-[90%] mx-auto"
          style={{ elevation: 10 }}
        >
          <View className="flex-row items-center justify-center gap-1">
            <TouchableOpacity className="bg-primary p-2 gap-2 rounded-lg items-center justify-center w-[100px]">
              <View className="bg-white rounded-full p-3">
                <MonitorDashboard
                  name="monitor-dashboard"
                  color="#5e7119"
                  size={30}
                />
              </View>
              <Text className="text-white font-semibold">Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary p-2 gap-2 rounded-lg items-center justify-center w-[100px]">
              <View className="bg-white rounded-full p-3">
                <Settings name="setting" color="#5e7119" size={30} />
              </View>
              <Text className="text-white font-semibold">Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary p-2 gap-2 rounded-lg items-center justify-center w-[100px]">
              <View className="bg-white rounded-full p-3">
                <Exception1 name="exception1" color="#5e7119" size={30} />
              </View>
              <Text className="text-white font-semibold">About</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between items-center mt-3 border-b border-zinc-400 pb-3 pt-1">
            <Text className="font-semibold">Password</Text>
            <TouchableOpacity onPress={() => setPasswordModalOpen(true)}>
              <Text className="text-primary font-semibold">Change</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between items-center mt-3 border-b border-zinc-400 pb-3 pt-1">
            <Text className="font-semibold">Birthday</Text>
            {userData.birthday ? (
              <Text className="text-primary font-semibold">
                {userData.birthday}
              </Text>
            ) : (
              <TouchableOpacity onPress={() => setModalOpen(true)}>
                <Text className="text-primary font-semibold">Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row justify-between items-center mt-3 pt-1">
            <Text className="font-semibold">Date Joined</Text>
            <Text className="text-primary font-semibold">
              {userData.createdAt}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          className="mt-5 mx-auto w-[90%] bg-primary rounded-lg py-3"
        >
          <Text className="text-center font-semibold text-white">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal isOpen={modalOpen}>
        <View className="bg-white w-full p-4 rounded-xl">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-lg">Birthday</Text>
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <Close name="close" color="#111" size={16} />
            </TouchableOpacity>
          </View>
          <Text className="text-xs mt-1 text-zinc-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium,
            nobis?
          </Text>
          <Pressable
            onPress={toggleDatePicker}
            className="flex flex-row mb-3 px-2 justify-start items-center relative shadow-lg rounded-md border border-neutral-400 mt-3 focus:border-primary"
          >
            <Calendar name="calendar" color="#5e7119" size={16} />
            <TextInput
              className={`rounded-md text-black py-1 px-2 flex-1 text-left`}
              style={{ flexShrink: 0 }}
              placeholder="Sat Jan 14 2000"
              value={birthdate}
              onChangeText={setBirthdate}
              editable={false}
              onPressIn={toggleDatePicker}
            />
            {showPicker && (
              <DateTimePicker
                mode="date"
                display="spinner"
                value={date}
                onChange={onChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </Pressable>
          <View className="flex-row items-center justify-center gap-3 px-2">
            {/* <TouchableOpacity className="bg-red-600 py-2 rounded-lg w-[47%]">
              <Text className="text-center text-white font-semibold">
                Cancel
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={submitBirthdate}
              className="w-full py-2 rounded-lg bg-primary"
            >
              <Text className="text-center text-white font-semibold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal isOpen={passwordModelOpen}>
        <View className="bg-white w-full p-4 rounded-xl">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-lg">Change Password</Text>
            <TouchableOpacity onPress={() => setPasswordModalOpen(false)}>
              <Close name="close" color="#111" size={16} />
            </TouchableOpacity>
          </View>
          <Text className="text-xs mt-1 text-zinc-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium,
            nobis?
          </Text>
          <View className="flex flex-row mb-1 px-2 justify-start items-center relative shadow-lg rounded-md border border-neutral-400 mt-3 focus:border-primary">
            <Lock name="lock" color="#5e7119" size={16} />
            <TextInput
              className={`rounded-md text-black py-1 px-2 flex-1 text-left`}
              style={{ flexShrink: 0 }}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? (
                <Eye name="eye" size={18} color="#777" />
              ) : (
                <EyeOff name="eye-off" size={18} color="#777" />
              )}
            </TouchableOpacity>
          </View>
          <View className="flex flex-row mb-3 px-2 justify-start items-center relative shadow-lg rounded-md border border-neutral-400 mt-1 focus:border-primary">
            <Lock name="lock" color="#5e7119" size={16} />
            <TextInput
              className={`rounded-md text-black py-1 px-2 flex-1 text-left`}
              style={{ flexShrink: 0 }}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isPasswordVisible1}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible1(!isPasswordVisible1)}
            >
              {isPasswordVisible1 ? (
                <Eye name="eye" size={18} color="#777" />
              ) : (
                <EyeOff name="eye-off" size={18} color="#777" />
              )}
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-center gap-3 px-2">
            {/* <TouchableOpacity className="bg-red-600 py-2 rounded-lg w-[47%]">
              <Text className="text-center text-white font-semibold">
                Cancel
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={submitPassword}
              className="w-full py-2 rounded-lg bg-primary"
            >
              <Text className="text-center text-white font-semibold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
