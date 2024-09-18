import { ScrollView, ImageBackground, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Crossword from "@/components/CrossWord";

const ActivityPage = () => {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Micro-Learn Hub",
          headerStyle: {
            backgroundColor: "#5e7119",
          },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView className="flex-1">
        <View className="flex-1">
          <ImageBackground
            source={require("../../assets/images/BG.png")}
            className="flex-1 px-5"
          >
            <Crossword />
          </ImageBackground>
        </View>
      </ScrollView>
    </>
  );
};

export default ActivityPage;
