import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import Loading1 from "react-native-vector-icons/AntDesign";

const SpinningLoader = ({ name, size }: { name: string; size: number }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      className="mr-3"
      style={[styles.spinner, { transform: [{ rotate: spin }] }]}
    >
      <Loading1 name={name} size={size} color="#ffffff" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  spinner: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SpinningLoader;
