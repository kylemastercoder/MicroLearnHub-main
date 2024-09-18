/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";

const questions = [
  {
    question:
      "What year did Selman Waksman and Albert Schatz lead a systematic effort to screen soil bacteria for antimicrobial compounds?",
    options: ["1886", "1900", "1915", "1920"],
    answer: "1920",
  },
  {
    question:
      "What year did NCTC and Wellcome Sanger Institute (WSI) launch a five-year project to sequence 3,000 bacterial strains from the collection using PacBio sequencing technology?",
    options: ["2003", "2011", "2014", "2018"],
    answer: "2011",
  },
  {
    question:
      "Theodore Escherich describes a bacterium which he called “_________”. A strain he isolated in 1886 is added to the collection upon its founding (NCTC 86).",
    options: [
      "Anthrax bacilli",
      "Shigella flexneri",
      "Enterobacteriaceae",
      "Bacterium coli commune",
    ],
    answer: "Bacterium coli commune",
  },
  {
    question:
      "German scientist provides proof of germ theory by injecting pure cultures of the Anthrax bacilli into mice.",
    options: [
      "Theodore Escherich",
      "Robert Koch",
      "Julius Petri",
      "Philip White",
    ],
    answer: "Robert Koch",
  },
  {
    question:
      "He returns from vacation and notices that a culture plate left lying out had become overgrown with staphylococci colonies, except where mold was growing. What was discovered?",
    options: ["Erythromycin", "Penicillin", "Antibiotic", "Amoxicillin"],
    answer: "Penicillin",
  },
  {
    question:
      "Fritz Kauffman and _____ co-develop a scheme for classifying salmonellae by serotype.",
    options: [
      "Theodore Escherich",
      "Robert Koch",
      "Julius Petri",
      "Philip White",
    ],
    answer: "Philip White",
  },
  {
    question:
      "In this year the mass production of penicillin started with funds from the US and British governments after the bombing of Pearl Harbor.",
    options: ["1924", "1934", "1944", "1954"],
    answer: "1944",
  },
  {
    question:
      "Edward Tatum and Joshua Lederberg produce the first gene map called ___.",
    options: [
      "Haemophilus influenzae",
      "E. coli K12",
      "Salmonellae",
      "Bacillus subtilis",
    ],
    answer: "E. coli K12",
  },
  {
    question:
      "He drinks a culture of the Helicobacter pylori (NCTC 11638 and 11639) to prove his theory that most stomach ulcers are caused by bacteria.",
    options: [
      "Barry Marshall",
      "Alexander Fleming",
      "Sarah Alexander",
      "Claire Fraser",
    ],
    answer: "Barry Marshall",
  },
  {
    question:
      "In what year do NCTC scientists complete the extraction of DNA from more than 3000 NCTC species and samples are delivered to WSI for sequencing using PacBio technology?",
    options: ["2012", "2014", "2016", "2018"],
    answer: "2018",
  },
];

const Quiz3 = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [feedbackColors, setFeedbackColors] = useState<Record<string, string>>(
    {}
  );
  const [showFeedback, setShowFeedback] = useState(false); // New state for showing feedback
  const progressAnim = useState(new Animated.Value(1))[0]; // Initialize the animation value
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentQuestion < questions.length) {
      // Timer setup
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval); // Clear interval when timer reaches 0
            handleSubmit(); // Automatically submit when timer reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Progress animation
      progressAnim.setValue(1); // Reset animation value
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 60 * 1000, // Duration in milliseconds (60 seconds)
        useNativeDriver: false,
      }).start();

      return () => clearInterval(interval); // Cleanup on unmount or before re-running effect
    }
  }, [currentQuestion]); // Depend on `currentQuestion` to reset the timer for each question

  const handleAnswerClick = (answer: string) => {
    if (showFeedback) return; // Prevent clicks if feedback is being shown
    setSelectedAnswer(answer);
  };

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null) return;

    const correctAnswer = questions[currentQuestion].answer;
    const updatedFeedbackColors: Record<string, string> = {};

    if (selectedAnswer === correctAnswer) {
      Toast.show({
        type: "success",
        position: "top",
        text1: "Correct!",
      });
      setScore((prevScore) => prevScore + 1);
      updatedFeedbackColors[selectedAnswer] = "#4caf50"; // Green for correct answer
    } else {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Incorrect!",
      });
      updatedFeedbackColors[selectedAnswer] = "#f44336"; // Red for incorrect answer
      updatedFeedbackColors[correctAnswer] = "#4caf50"; // Green for correct answer
    }

    setFeedbackColors(updatedFeedbackColors);
    setShowFeedback(true); // Show feedback

    // Delay the transition to the next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setTimer(60); // Reset timer to 60 seconds for the next question
        progressAnim.setValue(1); // Reset animation value
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 60 * 1000, // Duration in milliseconds (60 seconds)
          useNativeDriver: false,
        }).start(); // Restart animation
      } else {
        Alert.alert(
          "Quiz completed!",
          `Your score is ${score}/${questions.length}`
        );
        router.push("/lesson/QGL2yfP0QOjh1Ibp1jko");
      }
      setShowFeedback(false); // Hide feedback
    }, 5000); // Delay of 5 seconds
  }, [selectedAnswer, currentQuestion, score, progressAnim]);

  if (currentQuestion >= questions.length) return <Text>Quiz completed!</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.questionNumber}>
        Question {currentQuestion + 1}/{questions.length}
      </Text>
      <Text style={styles.question}>{questions[currentQuestion].question}</Text>
      <Text style={styles.timer}>Time left: {timer} seconds</Text>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      {questions[currentQuestion].options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            feedbackColors[option]
              ? { backgroundColor: feedbackColors[option] }
              : null,
            selectedAnswer === option && !feedbackColors[option]
              ? styles.selectedOption
              : null,
          ]}
          onPress={() => handleAnswerClick(option)}
          disabled={Boolean(feedbackColors[option]) || showFeedback} // Disable interaction if feedback is shown
        >
          <Text
            style={[
              styles.optionText,
              selectedAnswer === option && !feedbackColors[option]
                ? styles.selectedOptionText
                : null,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={showFeedback}
      >
        <Text style={styles.submitButtonText}>Next</Text>
      </TouchableOpacity>
      <Text style={styles.score}>
        Score: {score}/{questions.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: "#5e7119",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
  },
  timer: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressContainer: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5e7119",
  },
  option: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderColor: "#777",
    borderWidth: 2,
  },
  selectedOption: {
    borderColor: "#5e7119",
    borderWidth: 2,
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: "#5e7119",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#5e7119",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
});

export default Quiz3;
