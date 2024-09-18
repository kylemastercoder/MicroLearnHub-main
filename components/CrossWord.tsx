/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";

const grid = [
  [" ", "E", "S", "C", "H", "E", "R", "I", "C", "H", "I", "A", " ", " ", " "],
  [" ", "D", " ", " ", " ", " ", "O", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", "W", " ", " ", " ", " ", "B", " ", " ", "A", " ", " ", " ", " ", " "],
  [" ", "A", " ", " ", "F", "L", "E", "M", "I", "N", "G", " ", " ", " ", " "],
  [" ", "R", " ", " ", "R", " ", "R", " ", " ", "T", " ", " ", " ", " ", " "],
  [" ", "D", " ", " ", "E", " ", "T", " ", " ", "I", " ", " ", " ", " ", " "],
  [" ", "T", " ", " ", "E", " ", "K", " ", " ", "B", "E", "T", "T", "Y", " "],
  [" ", "A", " ", " ", "Z", " ", "O", " ", " ", "I", " ", " ", " ", " ", " "],
  [" ", "T", " ", " ", "E", " ", "C", " ", " ", "O", " ", "P", " ", " ", " "],
  [" ", "U", " ", " ", "D", " ", "H", " ", " ", "T", " ", "E", " ", " ", " "],
  [" ", "M", " ", " ", "R", " ", " ", " ", " ", "I", " ", "T", " ", " ", " "],
  [" ", " ", " ", " ", "Y", " ", " ", "U", "L", "C", "E", "R", "S", " ", " "],
  [" ", " ", " ", " ", "I", " ", " ", " ", " ", "S", " ", "I", " ", " ", " "],
  [" ", " ", " ", " ", "N", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "A", "G", "A", "R", " ", " ", " ", " ", " ", " ", " ", " "],
];

const clues = {
  across: [
    "Theodore Escherich describes a bacterium which was later to be called ________ coli.",
    "The scientist who accidentally discovered penicillin.",
    "Pioneering food safety microbiologist...",
    "A disease caused by Helicobacteria pylori.",
    "A dish invented by Julius Petri used for culturing bacteria.",
  ],
  down: [
    "He and Joshua Lederberg produced the first gene map of E. coli K12...",
    "NCTC introduce this to ensure longevity...",
    "A German scientist who provides proof of germ theory...",
    "Antibacterial compounds discovered by Waksman",
    "A scientist who invented the agar-coated glass dish...",
  ],
};

const Crossword = () => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [clueAnswers, setClueAnswers] = useState<{ [key: string]: string }>({});

  const handleAnswerChange = (text: string, row: number, col: number) => {
    const key = `${row}-${col}`;
    setAnswers({ ...answers, [key]: text.toUpperCase() });
  };

  const checkAnswer = (clueType: "across" | "down", clueIndex: number) => {
    const clueKey = `${clueType}-${clueIndex}`;
    const clue = clues[clueType][clueIndex];

    // Define the correct answers for each clue with their exact grid positions
    const cluePositions: string[] = [];
    let correctAnswerArray: string[] = [];

    if (clueType === "across") {
      if (clueIndex === 0) {
        // Clue 1 (across)
        cluePositions.push(
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9",
          "0-10",
          "0-11"
        );
        correctAnswerArray = [
          "E",
          "S",
          "C",
          "H",
          "E",
          "R",
          "I",
          "C",
          "H",
          "I",
          "A",
        ];
      } else if (clueIndex === 1) {
        // Clue 2 (across)
        cluePositions.push("3-4", "3-5", "3-6", "3-7", "3-8", "3-9", "3-10");
        correctAnswerArray = ["F", "L", "E", "M", "I", "N", "G"];
      } else if (clueIndex === 2) {
        // Clue 3 (across)
        cluePositions.push("6-9", "6-10", "6-11", "6-12", "6-13");
        correctAnswerArray = ["B", "E", "T", "T", "Y"];
      } else if (clueIndex === 3) {
        // Clue 4 (across)
        cluePositions.push("11-7", "11-8", "11-9", "11-10", "11-11", "11-12");
        correctAnswerArray = ["U", "L", "C", "E", "R", "S"];
      } else if (clueIndex === 4) {
        // Clue 5 (across)
        cluePositions.push("14-3", "14-4", "14-5", "14-6");
        correctAnswerArray = ["A", "G", "A", "R"];
      }
    } else if (clueType === "down") {
      if (clueIndex === 0) {
        // Clue 1 (down)
        cluePositions.push(
          "0-1",
          "1-1",
          "2-1",
          "3-1",
          "4-1",
          "5-1",
          "6-1",
          "7-1",
          "8-1",
          "9-1",
          "10-1"
        );
        correctAnswerArray = [
          "E",
          "D",
          "W",
          "A",
          "R",
          "D",
          "T",
          "A",
          "T",
          "U",
          "M",
        ];
      } else if (clueIndex === 1) {
        // Clue 2 (down)
        cluePositions.push(
          "3-4",
          "4-4",
          "5-4",
          "5-4",
          "7-4",
          "8-4",
          "9-4",
          "10-4",
          "11-4",
          "12-4",
          "13-4",
          "14-4"
        );
        correctAnswerArray = [
          "F",
          "R",
          "E",
          "E",
          "Z",
          "E",
          "D",
          "R",
          "Y",
          "I",
          "N",
          "G",
        ];
      } else if (clueIndex === 2) {
        // Clue 3 (down)
        cluePositions.push(
          "0-6",
          "1-6",
          "2-6",
          "3-6",
          "4-6",
          "5-6",
          "6-6",
          "7-6",
          "8-6",
          "9-6"
        );
        correctAnswerArray = ["R", "O", "B", "E", "R", "T", "K", "O", "C", "H"];
      } else if (clueIndex === 3) {
        // Clue 4 (down)
        cluePositions.push(
          "2-9",
          "3-9",
          "4-9",
          "5-9",
          "6-9",
          "7-9",
          "8-9",
          "9-9",
          "10-9",
          "11-9",
          "12-9"
        );
        correctAnswerArray = [
          "A",
          "N",
          "T",
          "I",
          "B",
          "I",
          "O",
          "T",
          "I",
          "C",
          "S",
        ];
      } else if (clueIndex === 4) {
        // Clue 5 (down)
        cluePositions.push("8-11", "9-11", "10-11", "11-11", "12-11");
        correctAnswerArray = ["P", "E", "T", "R", "I"];
      }
    }

    // Combine user answers for the clue
    const userAnswerArray = cluePositions.map((key) => answers[key] || " ");

    // Check if user answer matches the correct answer
    const isCorrect =
      JSON.stringify(userAnswerArray) === JSON.stringify(correctAnswerArray);
    const clueAnswerStatus = isCorrect ? "Correct" : "Incorrect";

    setClueAnswers({ ...clueAnswers, [clueKey]: clueAnswerStatus });

    showToast(
      isCorrect
        ? `Correct for clue ${clueIndex + 1}!`
        : `Incorrect for clue ${clueIndex + 1}. Try again.`,
      isCorrect ? "success" : "error"
    );
  };

  const showToast = (message: string, type: "success" | "error") => {
    Toast.show({
      type,
      text1: message,
      position: "top",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View key={colIndex} style={styles.cell}>
                {cell !== " " ? (
                  <TextInput
                    style={styles.input}
                    autoFocus
                    maxLength={1}
                    value={answers[`${rowIndex}-${colIndex}`] || ""}
                    onChangeText={(text) =>
                      handleAnswerChange(text, rowIndex, colIndex)
                    }
                  />
                ) : (
                  <View style={styles.emptyCell} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.clues}>
        <Text style={styles.clueHeader}>Across</Text>
        {clues.across.map((clue, index) => (
          <View key={`across-${index}`} style={styles.clueContainer}>
            <Text
              style={
                clueAnswers[`across-${index}`] === "Correct"
                  ? styles.correctClueText
                  : styles.incorrectClueText
              }
            >
              {index + 1}. {clue} - {clueAnswers[`across-${index}`]}
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-lg py-2 mt-2"
              onPress={() => checkAnswer("across", index)}
            >
              <Text className="text-center font-semibold text-white">
                Check Answer
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.clueHeader}>Down</Text>
        {clues.down.map((clue, index) => (
          <View key={`down-${index}`} style={styles.clueContainer}>
            <Text
              style={
                clueAnswers[`down-${index}`] === "Correct"
                  ? styles.correctClueText
                  : styles.incorrectClueText
              }
            >
              {index + 1}. {clue} - {clueAnswers[`down-${index}`]}
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-lg py-2 mt-2"
              onPress={() => checkAnswer("down", index)}
            >
              <Text className="text-center font-semibold text-white">
                Check Answer
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "column",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  input: {
    textAlign: "center",
    fontSize: 18,
  },
  emptyCell: {
    width: 20,
    height: 20,
    backgroundColor: "#111",
  },
  clues: {
    marginTop: 20,
  },
  clueHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clueContainer: {
    marginBottom: 10,
  },
  correctClueText: {
    fontSize: 16,
    color: "green",
  },
  incorrectClueText: {
    fontSize: 16,
    color: "red",
  },
});

export default Crossword;
