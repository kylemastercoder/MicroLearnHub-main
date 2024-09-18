/* eslint-disable prettier/prettier */
// import { Link } from "expo-router";
import GridSlider from "@/components/GridSlider";
import ProgressChart from "@/components/ProgressChart";
import RecentTopic from "@/components/RecentTopics";
import { db } from "@/config/FirebaseConfig";
import { useGetUser } from "@/hooks/getUser";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell from "react-native-vector-icons/MaterialCommunityIcons";

const Home = () => {
  const { userData } = useGetUser();
  const router = useRouter();
  const [items, setItems] = useState<
    {
      id: string;
      image: string;
      name: string;
      status: string;
    }[]
  >([]);
  const data = [
    { id: "1", title: "Box 1" },
    { id: "2", title: "Box 2" },
    { id: "3", title: "Box 3" },
    { id: "4", title: "Box 4" },
    { id: "5", title: "Box 5" },
    { id: "6", title: "Box 6" },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "Topics"));
      setItems(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          image: doc.data().image,
          name: doc.data().name,
          status: doc.data().status,
        }))
      );
    };

    fetchItems();
  }, []);

  if (!userData) return null;
  return (
    <SafeAreaView className="bg-general-500 px-5 h-screen">
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row items-center justify-between my-5">
          <View className="flex-row items-center">
            {userData.profile ? (
              <Image
                source={{ uri: userData.profile }}
                className="rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
                style={{ width: 60, height: 60, borderRadius: 50 }}
              />
            ) : (
              <View className="rounded-full item-center m-auto justify-center w-[60px] h-[60px] p-3 border-4 bg-zinc-100 border-primary">
                <Text className="text-center text-black font-bold text-lg">
                  K
                </Text>
              </View>
            )}
            <View className="ml-3">
              <Text className="text-primary">Hello!</Text>
              <Text className="text-primary font-semibold">
                {userData.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="relative">
            <Bell name="bell" size={30} color="#5e7119" />
            <View className="absolute top-0 items-center justify-center right-0 w-4 h-4 bg-danger-500 rounded-full">
              <Text className="text-[8px] text-white">2</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View>
          <Text className="text-primary font-semibold text-lg">
            Let's learn something new today!
          </Text>
          <View className="mt-2 bg-primary w-full px-5 py-16 rounded-xl"></View>
        </View>
        <View className="mt-10">
          <View className="flex-row justify-between items-center">
            <Text className="text-zinc-600 font-semibold text-lg">
              My Progress
            </Text>
            <TouchableOpacity>
              <Text className="font-semibold text-primary">See All</Text>
            </TouchableOpacity>
          </View>
          <View className="mt-2 border-2 border-primary w-full p-5 rounded-xl">
            <ProgressChart />
          </View>
        </View>
        <View className="mt-10">
          <View className="flex-row justify-between items-center">
            <Text className="text-zinc-600 font-semibold text-lg">
              Recent Viewed Topic
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/history")}
            >
              <Text className="font-semibold text-primary">See All</Text>
            </TouchableOpacity>
          </View>
          <RecentTopic data={items} />
        </View>
        <View className="mt-10">
          <View className="flex-row justify-between items-center">
            <Text className="text-zinc-600 font-semibold text-lg">
              Recent Played Game
            </Text>
            <TouchableOpacity>
              <Text className="font-semibold text-primary">See All</Text>
            </TouchableOpacity>
          </View>
          <GridSlider data={data} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
