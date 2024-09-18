import { ScrollView, ImageBackground, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Quiz3 from "@/components/Quiz3";

const Quiz3Page = () => {
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
            className="flex-1 h-screen -mt-10"
          >
            <Quiz3 />
          </ImageBackground>
        </View>
      </ScrollView>
    </>
  );
};

export default Quiz3Page;
