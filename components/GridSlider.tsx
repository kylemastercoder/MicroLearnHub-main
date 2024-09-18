import { View, Text, FlatList, Dimensions } from "react-native";
import React from "react";

type GridSliderProps = {
  data: { id: string; title: string }[];
};

const GridSlider = ({ data }: GridSliderProps) => {
  const { width } = Dimensions.get("window");
  const itemWidth = width / 3 - 20;
  const renderItem = ({ item }: { item: { id: string; title: string } }) => (
    <View
      style={{ width: itemWidth }}
      className="mr-2 mt-2 h-32 bg-primary justify-center items-center rounded-md"
    >
      <Text className="text-white text-lg font-semibold">{item.title}</Text>
    </View>
  );
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

export default GridSlider;
