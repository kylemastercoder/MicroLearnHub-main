/* eslint-disable prettier/prettier */
import Modal from "@/components/Modal";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LockClosed from "react-native-vector-icons/Ionicons";

const History = () => {
  const [items, setItems] = useState<
    { id: string; image: string; status: string }[]
  >([]);
  // const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "Topics"));
      setItems(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          image: doc.data().image,
          status: doc.data().status,
        }))
      );
    };

    fetchItems();
  }, []);

  const handlePress = (id: string, status: string) => {
    if (status === "close") {
      setModalVisible(true);
    } else if (id === "kEdK6qz0jBR9a6DE3x2G") {
      router.push(`/lesson/topic3`);
    } else {
      router.push(`/lesson/${id}`);
    }
  };

  return (
    <>
      <Modal
        isOpen={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="bg-[#FF4C4B] rounded-md p-5">
          <Text className="text-md text-white">
            The topic is locked. Please finish the previous topic before
            accessing this one.
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="bg-white rounded-md py-2 mt-3"
          >
            <Text className="text-center font-semibold">Ok, Understood!</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <SafeAreaView className="flex-1">
        <ImageBackground
          source={require("../../../assets/images/BG.png")}
          className="flex-1"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              {items.map((item, index) => (
                // @ts-ignore
                <View key={item.id}>
                  <TouchableOpacity
                    className={`relative ${index % 2 === 0 ? "ml-5 self-start" : "mr-5 self-end"}`}
                    onPress={() => handlePress(item.id, item.status)}
                  >
                    {item.status === "close" && (
                      <View
                        className="rounded-full bottom-9 right-8"
                        style={{
                          width: 80,
                          height: 80,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          position: "absolute",
                          zIndex: 10,
                        }}
                      />
                    )}
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 150, height: 150 }}
                    />
                    {item.status === "close" && (
                      <View className="absolute bottom-16 z-50 right-14">
                        <LockClosed name="lock-closed" size={30} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

export default History;
