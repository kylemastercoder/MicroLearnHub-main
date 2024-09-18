/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";

type RecentTopicProps = {
  data: { id: string; name: string; image: string; status: string }[];
};

const RecentTopic = ({ data }: RecentTopicProps) => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const itemWidth = width / 1 - 100;
  const [lessons, setLessons] = useState<
    {
      id: string;
      topicId: string;
      title: string;
      histories: {
        id: string;
        year: string;
        content: string;
        success: boolean;
      }[];
    }[]
  >([]);

  useEffect(() => {
    const fetchLessonsAndHistories = async () => {
      try {
        const lessonsQuery = query(
          collection(db, "Lessons"),
          where("topicId", "==", data[0]?.id)
        );

        const lessonQuerySnapshot = await getDocs(lessonsQuery);
        const lessonList = await Promise.all(
          lessonQuerySnapshot.docs.map(async (doc) => {
            const lessonData = doc.data();
            const lessonId = doc.id;

            const historiesQuery = query(
              collection(db, "History"),
              where("__name__", "in", lessonData.content)
            );
            const historyQuerySnapshot = await getDocs(historiesQuery);
            const histories = historyQuerySnapshot.docs.map((historyDoc) => ({
              id: historyDoc.id,
              year: historyDoc.data().year,
              content: historyDoc.data().content,
              success: historyDoc.data().success,
            }));

            const sortedHistories = lessonData.content
              .map((id: string) =>
                histories.find((history) => history.id === id)
              )
              .filter((history: any) => history !== undefined);

            return {
              id: lessonId,
              topicId: lessonData.topicId,
              title: lessonData.title,
              histories: sortedHistories,
            };
          })
        );

        const sortedLessons = lessonList.sort(
          (a, b) => parseInt(a.title) - parseInt(b.title)
        );
        setLessons(sortedLessons);
      } catch (error) {
        console.error("Error fetching lessons and histories:", error);
      }
    };

    if (data[0]?.id) {
      fetchLessonsAndHistories();
    }
  }, [data]);

  const renderItem = ({
    item,
  }: {
    item: { id: string; name: string; image: string; status: string };
  }) => {
    const totalHistories = lessons.reduce(
      (acc, lesson) => acc + lesson.histories.length,
      0
    );
    const successfulHistories = lessons.reduce(
      (acc, lesson) =>
        acc + lesson.histories.filter((history) => history.success).length,
      0
    );
    const progressWidth =
      totalHistories > 0 ? (successfulHistories / totalHistories) * 100 : 0;
    return (
      <View
        style={{ width: itemWidth }}
        className={`mr-2 mt-2 h-[150px] p-5 bg-[#94b447] rounded-2xl ${item.status === "close" ? "hidden" : ""}`}
      >
        <View className="flex-row items-start">
          <View>
            <Text className="text-black text-[14px] w-40 font-black">
              {item.name}
            </Text>
            <View
              style={{ elevation: 5, shadowColor: "#000" }}
              className="bg-gray-100 w-full py-2 px-0.5 justify-center h-3 rounded-xl mt-3"
            >
              <View
                className="bg-[#5c6d1d] rounded-xl h-3"
                style={{ width: `${progressWidth}%` }}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/lesson/${item.id}`)}
              className="bg-primary mt-2 py-2 rounded-xl"
            >
              <Text className="text-white text-xs font-bold text-center">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: item.image }}
            style={{ width: 80, height: 80 }}
          />
        </View>
      </View>
    );
  };
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default RecentTopic;
