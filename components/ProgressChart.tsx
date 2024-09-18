import { Text, View } from "react-native";
import React from "react";
import { PieChart } from "react-native-gifted-charts";

const ProgressChart = () => {
  const pieData = [
    {
      value: 47,
      color: "#cbe155",
    },
    { value: 40, color: "#5baca2" },
    { value: 16, color: "#445669" },
  ];

  const renderDot = (color: string) => {
    return (
      <View
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: color,
          marginRight: 5,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
        <View className="flex-row justify-center gap-5">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {renderDot("#cbe155")}
            <Text style={{ color: "black" }}>Lesson</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {renderDot("#5baca2")}
            <Text style={{ color: "black" }}>Activity</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {renderDot("#445669")}
            <Text style={{ color: "black" }}>Quiz</Text>
          </View>
        </View>
      </>
    );
  };
  return (
    <View className="items-center justify-center">
      <PieChart
        isAnimated
        donut
        radius={90}
        innerCircleColor={"#fff"}
        data={pieData}
      />
      <View className="mt-5">{renderLegendComponent()}</View>
    </View>
  );
};

export default ProgressChart;
