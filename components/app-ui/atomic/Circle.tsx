// Circles.tsx
// import { Pressable } from '@gluestack-ui/themed';
import { Pressable } from "react-native";
import React from "react";

type CircleProps = {
  size: number;
  color?: string;
  onCirclePress?: () => void;
};

const isWhiteColor = (color: string): boolean => {
  const whiteColors = ["#ffffff", "#fff", "white", "#fafafa", "#f5f5f5", "#f0f0f0"];
  return whiteColors.includes(color.toLowerCase());
};

export const Circle = ({ size, color = "#ffcd00", onCirclePress }: CircleProps) => {
  return (
    <Pressable
      style={{
        width: size,
        aspectRatio: 1,
        borderRadius: 9999,
        backgroundColor: color,
        overflow: "hidden",
        borderWidth: isWhiteColor(color) ? 1 : 0,
        borderColor: isWhiteColor(color) ? "#000000" : "transparent",
      }}
      onPress={onCirclePress}
    />
  );
};

export default Circle;
