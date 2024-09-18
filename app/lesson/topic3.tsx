import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import Modal from "@/components/Modal";
// import Prokaryotes from "@/components/Prokaryotes";
import Crossword from "@/components/CrossWord";
import Quiz3 from "@/components/Quiz3";

const Topic3 = () => {
  const id = "kEdK6qz0jBR9a6DE3x2G";
  const [pageLoaded, setIsPageLoaded] = useState(false);
  const [topic, setTopic] = useState<{
    name: string;
    id: string;
    objective: string;
  } | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicDocRef = doc(db, "Topics", id as string);
        const topicDoc = await getDoc(topicDocRef);
        if (topicDoc.exists()) {
          setTopic({
            id: topicDoc.id,
            name: topicDoc.data().name,
            objective: topicDoc.data().objective,
          });
          setIsPageLoaded(true);
        } else {
          console.log("No such topic!");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [id]);
  return (
    <>
      <Modal isOpen={pageLoaded}>
        <View className="rounded-md bg-[#d4e1b5] border-2 border-[#5c6d1d] p-5">
          <Text className="text-lg font-bold">Objectives:</Text>
          <Text className="text-md mb-3">{topic?.objective}</Text>
          <TouchableOpacity
            className="px-5 bg-primary py-2 rounded-md"
            onPress={() => setIsPageLoaded(false)}
          >
            <Text className="text-white text-center">Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Stack.Screen
        options={{
          title: topic?.name || "Micro-Learn Hub",
          headerStyle: {
            backgroundColor: "#5e7119",
          },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView className="flex-1 px-5 py-5 h-screen">
        <View style={{ flex: 1 }}>
          <Text className="font-bold text-lg">MICROBIOLOGY:</Text>
          <Text className="text-xs text-zinc-700">
            Microbiology is the study of tiny creatures that can't be seen by
            the naked eye also known as microorganisms. It is composed of
            bacteria, protozoa, fungi, algae, as well as viruses. When it comes
            to the environmental aspect. It balances ecological aspects
            particularly in marine and freshwater environments. Microbes from
            the soil recycle the relevant elements through breaking down waste.
            Microbes are also used in products such as acetone and butanol, it
            was discovered by Chaim Weizmann. It was also used in making cordite
            or smokeless gunpowder during world war 1. While in the food
            industry microbes are associated with vinegar, cheese, soy sauce,
            yogurt and more. They are also used for producing genetically
            manipulated product such as cellulose, human insulin and proteins
            for vaccines.
          </Text>
          <Text className="font-bold mt-3 text-lg">CELLULAR CELLS:</Text>
          <Text>
            Prokaryotes - a unicellular organism which consists of bacteria and
            archaea.
          </Text>
          {/* <Prokaryotes /> */}
          {/* <Crossword /> */}
          <Quiz3 />
        </View>
      </ScrollView>
    </>
  );
};

export default Topic3;
