/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import Timeline from "react-native-timeline-flatlist";
import GridOutline from "react-native-vector-icons/Ionicons";
import FilterOutline from "react-native-vector-icons/Ionicons";
import ExclamationCircle from "react-native-vector-icons/AntDesign";
import Close from "react-native-vector-icons/FontAwesome";
import Modal from "@/components/Modal";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useGetUser } from "@/hooks/getUser";
import { useAuth, useUser } from "@clerk/clerk-expo";

const { width, height } = Dimensions.get("screen");

function clamp(val: any, min: any, max: any) {
  return Math.min(Math.max(val, min), max);
}

type History = {
  lessonId: string;
  id: string;
  year: string;
  content: string;
  success: boolean;
};

interface ReviewQuestion {
  id: string;
  reviewNumber: string;
  questions: string;
  answers: string[];
  correctAnswers: string;
  userIds: string[];
}

const Lesson = () => {
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startTranslationX = useSharedValue(0);
  const startTranslationY = useSharedValue(0);
  const startPinchCenterX = useSharedValue(0);
  const startPinchCenterY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart((event) => {
      startScale.value = scale.value;
      startTranslationX.value = translationX.value;
      startTranslationY.value = translationY.value;
      startPinchCenterX.value = event.focalX;
      startPinchCenterY.value = event.focalY;
    })
    .onUpdate((event) => {
      // Calculate new scale
      scale.value = clamp(
        startScale.value * event.scale,
        0.5,
        Math.min(width / 100, height / 100)
      );

      // Calculate scale ratio
      const scaleRatio = scale.value / startScale.value;

      // Calculate translation offsets
      const offsetX =
        (event.focalX - startPinchCenterX.value) * (1 - scaleRatio);
      const offsetY =
        (event.focalY - startPinchCenterY.value) * (1 - scaleRatio);

      // Update translation values
      translationX.value = clamp(
        startTranslationX.value - offsetX, // Adjusted to subtract the offset
        (-width / 2) * scale.value + width / 2,
        (width / 2) * scale.value - width / 2
      );
      translationY.value = clamp(
        startTranslationY.value - offsetY, // Adjusted to subtract the offset
        (-height / 2) * scale.value + height / 2,
        (height / 2) * scale.value - height / 2
      );
    })
    .runOnJS(true);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = 1;
      translationX.value = 0;
      translationY.value = 0;
    });

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const { id } = useLocalSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{
    lessonId: string;
    year: string;
    content: string;
  } | null>(null);
  const [topic, setTopic] = useState<{
    name: string;
    id: string;
    objective: string;
  } | null>(null);
  const [lessons, setLessons] = useState<
    {
      id: string;
      title: string;
      histories: {
        id: string;
        year: string;
        content: string;
        success: boolean;
      }[];
    }[]
  >([]);
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [objectiveModal, setObjectiveModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [firstHistory, setFirstHistory] = useState<History | null>(null);
  const [lastHistory, setLastHistory] = useState<History | null>(null);
  const [firstReviewQuestionModal, setFirstReviewQuestionModal] =
    useState(false);
  const [firstReviewQuestion, setFirstReviewQuestion] =
    useState<ReviewQuestion | null>(null);
  const [firstReviewAnswer, setFirstReviewAnswer] = useState("");
  const [secondReviewQuestionModal, setSecondReviewQuestionModal] =
    useState(false);
  const [secondReviewQuestion, setSecondReviewQuestion] =
    useState<ReviewQuestion | null>(null);
  const [secondReviewAnswer, setSecondReviewAnswer] = useState("");
  const [quizModal, setQuizModal] = useState(false);

  const { userData } = useGetUser();
  const { user } = useUser();
  const clerkId = user?.id;

  useEffect(() => {
    const findFirstHistory = () => {
      if (lessons && lessons.length > 0) {
        const allHistories = lessons.flatMap((lesson) =>
          lesson.histories.map((history) => ({
            ...history,
            lessonId: lesson.id,
          }))
        );
        // Sort histories by year
        const sortedHistories = allHistories.sort(
          (a, b) => parseInt(a.year, 10) - parseInt(b.year, 10)
        );
        setFirstHistory(sortedHistories[0]);
      }
    };

    findFirstHistory();
  }, [lessons]);

  useEffect(() => {
    const checkUserHistoriesForYear2018 = async () => {
      try {
        if (clerkId) {
          const userQuery = query(
            collection(db, "Users"),
            where("clerkId", "==", clerkId)
          );
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const histories = userDoc.data().histories || [];

            // Check if year 2018 is included in the histories array
            const includes2018 = histories.some(
              (history: { id: string }) => history.id === "o34TcraqufPoXAOa06Pc"
            );
            console.log("Histories:", histories[23]);

            if (histories[23] === "o34TcraqufPoXAOa06Pc") {
              setQuizModal(true);
            } else {
              setQuizModal(false);
            }
          } else {
            console.error("User document not found for clerkId:", clerkId);
          }
        } else {
          console.error("User clerk ID not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    checkUserHistoriesForYear2018();
  }, [clerkId]);

  const router = useRouter();

  useEffect(() => {
    const insertFirstHistory = async () => {
      if (firstHistory && userData?.clerkId) {
        try {
          // Update the success status in Firestore
          const historyDocRef = doc(db, "History", firstHistory.id);
          await updateDoc(historyDocRef, { success: true });

          // Query for the user document by clerkId
          const userQuery = query(
            collection(db, "Users"),
            where("clerkId", "==", userData.clerkId)
          );

          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, "Users", userDoc.id);

            // Add the firstHistory ID to the user's histories array
            await updateDoc(userDocRef, {
              histories: arrayUnion(firstHistory.id),
            });

            console.log(
              "First history inserted into user document successfully"
            );

            // Set the page as loaded
            setPageLoaded(true);
            // router.push(`/lesson/${id}`);
          } else {
            console.error(
              "User document not found for clerkId:",
              userData.clerkId
            );
          }
        } catch (error) {
          console.error(
            "Error inserting first history into user document:",
            error
          );
        }
      } else {
        console.error("First history or userData not found.");
      }
    };

    if (firstHistory && userData?.clerkId) {
      insertFirstHistory();
    }
  }, [firstHistory, userData]);

  const handleProceed = async () => {
    if (selectedHistory) {
      const { year } = selectedHistory;
      const currentYear = parseInt(year, 10);

      // Get the sorted years from all lessons
      const allHistories = lessons.flatMap((lesson) =>
        lesson.histories.map((history) => ({
          ...history,
          lessonId: lesson.id,
        }))
      );

      const sortedYears = allHistories
        .map((history) => parseInt(history.year, 10))
        .filter((year) => !isNaN(year))
        .sort((a, b) => a - b);

      const nextYear = sortedYears.find((y) => y > currentYear);

      if (nextYear) {
        const nextHistory = allHistories.find(
          (history) => parseInt(history.year, 10) === nextYear
        );

        if (nextHistory) {
          const lessonToUpdate = lessons.find(
            (lesson) => lesson.id === nextHistory.lessonId
          );

          if (lessonToUpdate) {
            try {
              const historyDocRef = doc(db, "History", nextHistory.id);
              await updateDoc(historyDocRef, { success: true });
              console.log("Document updated successfully");

              // Update the state to reflect the change
              const updatedHistories = lessonToUpdate.histories.map(
                (history) => ({
                  ...history,
                  success:
                    parseInt(history.year, 10) === nextYear
                      ? true
                      : history.success,
                })
              );

              setLessons((prevLessons) =>
                prevLessons.map((lesson) =>
                  lesson.id === lessonToUpdate.id
                    ? { ...lesson, histories: updatedHistories }
                    : lesson
                )
              );

              console.log("Updated Lessons:", lessons);

              if (userData?.clerkId) {
                const userQuery = query(
                  collection(db, "Users"),
                  where("clerkId", "==", userData.clerkId)
                );

                const querySnapshot = await getDocs(userQuery);
                if (!querySnapshot.empty) {
                  const userDoc = querySnapshot.docs[0];
                  const userDocRef = doc(db, "Users", userDoc.id);

                  await updateDoc(userDocRef, {
                    histories: arrayUnion(nextHistory.id),
                  });

                  setLessons((prevLessons) =>
                    prevLessons.map((lesson) =>
                      lesson.id === lessonToUpdate.id
                        ? { ...lesson, histories: updatedHistories }
                        : lesson
                    )
                  );

                  // Close the modal
                  setIsModalVisible(false);
                  // window.location.reload();
                } else {
                  console.error(
                    "User document not found for clerkId:",
                    userData.clerkId
                  );
                }
              } else {
                console.error("User clerk ID not found.");
              }
            } catch (error) {
              console.error("Error updating success status:", error);
            }
          } else {
            console.error("Lesson not found for next year:", nextYear);
          }
        } else {
          console.error("Next history not found for year:", nextYear);
        }
      } else {
        console.error(
          "Next year not found. Current year might be the latest or data issue:",
          {
            currentYear,
            sortedYears,
          }
        );
      }
    } else {
      console.error("No selected history.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    router.replace(`/lesson/${id}`);
    setRefreshing(false);
  };

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
          setPageLoaded(true);
        } else {
          console.log("No such topic!");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [id]);

  useEffect(() => {
    const fetchLessonsAndHistories = async () => {
      try {
        const lessonsQuery = query(
          collection(db, "Lessons"),
          where("topicId", "==", id)
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

            // const hasHistoryBefore1900 = histories.some(
            //   (history) => history.year === "1890"
            // );

            // const hasHistoryBefore1942 = histories.some(
            //   (history) => history.year === "1941"
            // );

            // if (hasHistoryBefore1900) {
            //   const userId = userData?.clerkId;
            //   if (userId) {
            //     const q = query(
            //       collection(db, "ReviewQuestions"),
            //       where("topicId", "==", id),
            //       where("userIds", "array-contains", userId)
            //     );
            //     const reviewQuerySnapshot = await getDocs(q);

            //     if (reviewQuerySnapshot.empty) {
            //       setFirstReviewQuestionModal(true);
            //     }
            //   } else {
            //     setFirstReviewQuestionModal(true);
            //   }
            // } else if (hasHistoryBefore1942) {
            //   const userId = userData?.clerkId;
            //   if (userId) {
            //     const q = query(
            //       collection(db, "ReviewQuestions"),
            //       where("topicId", "==", id),
            //       where("userIds", "array-contains", userId)
            //     );
            //     const reviewQuerySnapshot = await getDocs(q);

            //     if (reviewQuerySnapshot.empty) {
            //       setSecondReviewQuestionModal(true);
            //     }
            //   } else {
            //     setSecondReviewQuestionModal(true);
            //   }
            // } else {
            //   setSecondReviewQuestionModal(false);
            //   setFirstReviewQuestionModal(false);
            // }

            const sortedHistories = lessonData.content
              .map((id: string) =>
                histories.find((history) => history.id === id)
              )
              .filter((history: any) => history !== undefined) as {
              id: string;
              year: string;
              content: string;
              success: boolean;
            }[];

            return {
              id: lessonId,
              title: lessonData.title,
              lessonNumber: lessonData.lessonNumber,
              histories: sortedHistories,
            };
          })
        );

        const sortedLessons = lessonList.sort(
          (a, b) => parseInt(a.lessonNumber) - parseInt(b.lessonNumber)
        );

        setLessons(sortedLessons);
      } catch (error) {
        console.error("Error fetching lessons and histories:", error);
      }
    };

    if (id) {
      fetchLessonsAndHistories();
    }
  }, [id, userData?.clerkId]);

  // useEffect(() => {
  //   const fetchFirstReviewQuestions = async () => {
  //     try {
  //       const q = query(
  //         collection(db, "ReviewQuestions"),
  //         where("topicId", "==", id),
  //         where("reviewNumber", "==", "1")
  //       );
  //       const querySnapshot = await getDocs(q);
  //       if (!querySnapshot.empty) {
  //         const firstDoc = querySnapshot.docs[0];
  //         const data = firstDoc.data();
  //         const userId = userData?.clerkId;

  //         if (data.userIds && data.userIds.includes(userId)) {
  //           console.log("User has already answered this question.");
  //           setFirstReviewQuestionModal(false);
  //           return null;
  //         }

  //         setFirstReviewQuestion({
  //           id: firstDoc.id,
  //           reviewNumber: data.reviewNumber,
  //           questions: data.questions,
  //           answers: data.answers,
  //           correctAnswers: data.correctAnswers,
  //           userIds: data.userIds || [],
  //         });

  //         setFirstReviewQuestionModal(true);
  //       } else {
  //         console.log("No review questions found for this topic!");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching review question:", error);
  //     }
  //   };

  //   const fetchSecondReviewQuestions = async () => {
  //     try {
  //       const q = query(
  //         collection(db, "ReviewQuestions"),
  //         where("topicId", "==", id),
  //         where("reviewNumber", "==", "2")
  //       );
  //       const querySnapshot = await getDocs(q);
  //       if (!querySnapshot.empty) {
  //         const firstDoc = querySnapshot.docs[0];
  //         const data = firstDoc.data();
  //         const userId = userData?.clerkId;

  //         if (data.userIds && data.userIds.includes(userId)) {
  //           console.log("User has already answered this question.");
  //           setFirstReviewQuestionModal(false);
  //           return null;
  //         }

  //         setSecondReviewQuestion({
  //           id: firstDoc.id,
  //           reviewNumber: data.reviewNumber,
  //           questions: data.questions,
  //           answers: data.answers,
  //           correctAnswers: data.correctAnswers,
  //           userIds: data.userIds || [],
  //         });

  //         setFirstReviewQuestionModal(true);
  //       } else {
  //         console.log("No review questions found for this topic!");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching review question:", error);
  //     }
  //   };

  //   fetchFirstReviewQuestions();
  //   fetchSecondReviewQuestions();
  // }, [id, userData?.clerkId]);

  const submitFirstQuestion = async () => {
    if (!firstReviewQuestion || !firstReviewQuestion.id) {
      console.error("Review question not found");
      return;
    }

    // Reference to the correct answer document in Firestore
    const questionRef = doc(db, "ReviewQuestions", firstReviewQuestion.id);

    try {
      // Fetch the document
      const docSnapshot = await getDoc(questionRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const correctAnswer = data.correctAnswer;

        // Check if the inputted answer matches the correct answer
        if (
          firstReviewAnswer.trim().toLowerCase() ===
          correctAnswer.trim().toLowerCase()
        ) {
          console.log("Answer is correct!");

          // Get current user ID
          const userId = userData?.clerkId;

          if (userId) {
            // Update Firestore to include user ID
            await updateDoc(questionRef, {
              userIds: [...(data.userIds || []), userId],
            });

            // Hide the modal if needed
            setFirstReviewQuestionModal(false);
            ToastAndroid.show("Answer is correct!", ToastAndroid.SHORT);
          }
        } else {
          console.log("Answer is incorrect.");
          ToastAndroid.show("Answer is incorrect.", ToastAndroid.SHORT);
        }
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching or updating question:", error);
    }
  };

  const submitSecondQuestion = async () => {
    if (!secondReviewQuestion || !secondReviewQuestion.id) {
      console.error("Review question not found");
      return;
    }

    // Reference to the correct answer document in Firestore
    const questionRef = doc(db, "ReviewQuestions", secondReviewQuestion.id);

    try {
      // Fetch the document
      const docSnapshot = await getDoc(questionRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const correctAnswer = data.correctAnswer;

        // Check if the inputted answer matches the correct answer
        if (
          secondReviewAnswer.trim().toLowerCase() ===
          correctAnswer.trim().toLowerCase()
        ) {
          console.log("Answer is correct!");

          // Get current user ID
          const userId = userData?.clerkId;

          if (userId) {
            // Update Firestore to include user ID
            await updateDoc(questionRef, {
              userIds: [...(data.userIds || []), userId],
            });

            // Hide the modal if needed
            setSecondReviewQuestionModal(false);
            ToastAndroid.show("Answer is correct!", ToastAndroid.SHORT);
          }
        } else {
          console.log("Answer is incorrect.");
          ToastAndroid.show("Answer is incorrect.", ToastAndroid.SHORT);
        }
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching or updating question:", error);
    }
  };

  const renderLessonItem = ({
    item: lesson,
  }: {
    item: {
      id: string;
      title: string;
      histories: {
        id: string;
        year: string;
        content: string;
        success: boolean;
      }[];
    };
  }) => {
    const userHistories = userData?.histories || [];
    const filteredHistories = lesson.histories.filter((history) =>
      userHistories.includes(history.id)
    );

    if (filteredHistories.length === 0) {
      return (
        <View
          key={lesson.id}
          style={{ marginBottom: 24, alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#333",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {lesson.title}
          </Text>
          <Text style={{ textAlign: "center", color: "#888" }}>
            Unlock the current lesson first.
          </Text>
        </View>
      );
    }

    return (
      <View key={lesson.id} style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#333",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {lesson.title}
        </Text>
        <Timeline
          data={filteredHistories.map((history) => ({
            time: history.year,
            description: history.success ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedHistory({
                    lessonId: lesson.id,
                    year: history.year,
                    content: history.content,
                  });
                  setIsModalVisible(true);
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    backgroundColor: "#5d6e1e",
                    padding: 5,
                    height: "auto",
                    borderRadius: 10,
                    textAlign: "center",
                  }}
                >
                  {history.content}
                </Text>
              </TouchableOpacity>
            ) : (
              ""
            ),
            circleColor: history.success ? "#94b447" : "#999",
            lineColor: history.success ? "#94b447" : "#999",
            backgroundColor: history.success ? "#5d6e1e" : "#808080",
          }))}
          circleSize={15}
          innerCircle={isGridLayout ? "dot" : "none"}
          circleColor={isGridLayout ? "#94b447" : "#fff"}
          timeContainerStyle={{ minWidth: 30, marginTop: -5 }}
          lineColor="#94b447"
          renderFullLine={true}
          timeStyle={{
            textAlign: "center",
            backgroundColor: "#5d6e1e",
            color: "white",
            padding: 5,
            borderRadius: 13,
          }}
          isUsingFlatlist={true}
          descriptionStyle={{
            color: "#fff",
            backgroundColor: "#5d6e1e",
            padding: 5,
            height: "auto",
            borderRadius: 10,
            textAlign: "center",
          }}
          separator={true}
          columnFormat={isGridLayout ? "two-column" : "single-column-left"}
        />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: topic?.name || "Micro-Learn Hub",
          headerStyle: {
            backgroundColor: "#5e7119",
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() => setIsGridLayout((prev) => !prev)}
              >
                {isGridLayout ? (
                  <GridOutline name="grid-outline" size={24} color="white" />
                ) : (
                  <FilterOutline
                    name="filter-outline"
                    size={24}
                    color="white"
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setObjectiveModal(true)}
                className="ml-3"
              >
                <ExclamationCircle
                  name="exclamationcircleo"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </>
          ),
        }}
      />

      <Modal isOpen={objectiveModal}>
        <View className="rounded-md bg-[#d4e1b5] border-2 border-[#5c6d1d] p-5">
          <Text className="text-lg font-bold">Objectives:</Text>
          <Text className="text-md mb-3">{topic?.objective}</Text>
          <TouchableOpacity
            className="px-5 bg-primary py-2 rounded-md"
            onPress={() => setObjectiveModal(false)}
          >
            <Text className="text-white text-center">Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isOpen={quizModal}>
        <View className="rounded-md bg-[#d4e1b5] border-2 border-[#5c6d1d] p-5">
          <Text className="text-lg font-bold">Quiz and Activity:</Text>
          <Text className="text-md mb-3">
            Are you ready for interactive quiz and activity?
          </Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="px-5 bg-primary py-2 rounded-md w-[46%]"
              onPress={() => router.push("/lesson/quiz3")}
            >
              <Text className="text-white text-center">Start Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-5 bg-primary py-2 rounded-md w-[46%]"
              onPress={() => router.push("/lesson/activity")}
            >
              <Text className="text-white text-center">Start Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f4f4f4",
          height: "100%",
        }}
      >
        <GestureHandlerRootView>
          <ImageBackground
            source={require("../../assets/images/BG.png")}
            style={{ flex: 1 }}
          >
            <GestureDetector gesture={Gesture.Simultaneous(pinch, doubleTap)}>
              <Animated.View style={boxAnimatedStyles}>
                <FlatList
                  pinchGestureEnabled={false}
                  data={lessons}
                  renderItem={renderLessonItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                  }}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              </Animated.View>
            </GestureDetector>
          </ImageBackground>
        </GestureHandlerRootView>
      </SafeAreaView>

      <Modal isOpen={isModalVisible}>
        <View className="rounded-md bg-white p-5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[16px] font-bold">History</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Close name="close" size={18} />
            </TouchableOpacity>
          </View>
          <Text className="text-[16px] mb-2">{selectedHistory?.content}</Text>
          <TouchableOpacity
            className="px-2 bg-primary py-2 rounded-md"
            onPress={handleProceed}
          >
            <Text className="text-white text-center">Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isOpen={firstReviewQuestionModal}>
        <View className="rounded-md bg-[#d4e1b5] border-2 border-[#5c6d1d] p-5">
          <Text className="text-[16px] font-bold mb-2">Review Questions</Text>
          <Text className="text-[16px] mb-2">
            {firstReviewQuestion?.questions}
          </Text>
          <View className="flex-col space-y-1 mb-4">
            {firstReviewQuestion?.answers.map((answer, index) => (
              <Text key={answer} className="text-[16px]">
                {String.fromCharCode(97 + index)}. {answer}{" "}
              </Text>
            ))}
          </View>
          <TextInput
            value={firstReviewAnswer}
            onChangeText={setFirstReviewAnswer}
            placeholder="Enter your complete answer here"
            className="rounded-md bg-white border px-2 text-black mb-4"
          />
          <TouchableOpacity
            onPress={submitFirstQuestion}
            className="px-2 bg-primary py-2 rounded-md"
          >
            <Text className="text-white text-center">Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isOpen={secondReviewQuestionModal}>
        <View className="rounded-md bg-[#d4e1b5] border-2 border-[#5c6d1d] p-5">
          <Text className="text-[16px] font-bold mb-2">Review Questions</Text>
          <Text className="text-[16px] mb-2">
            {secondReviewQuestion?.questions}
          </Text>
          <View className="flex-col space-y-1 mb-4">
            {secondReviewQuestion?.answers.map((answer, index) => (
              <Text key={answer} className="text-[16px]">
                {String.fromCharCode(97 + index)}. {answer}{" "}
              </Text>
            ))}
          </View>
          <TextInput
            value={secondReviewAnswer}
            onChangeText={setSecondReviewAnswer}
            placeholder="Enter your complete answer here"
            className="rounded-md bg-white border px-2 text-black mb-4"
          />
          <TouchableOpacity
            onPress={submitSecondQuestion}
            className="px-2 bg-primary py-2 rounded-md"
          >
            <Text className="text-white text-center">Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default Lesson;
