// Circles.tsx
import React from "react";
import { View } from "react-native";
import Circle from "./Circle";

type CircleProps = {
  size: number;
  colors?: string[];
  onCirclePress?: (index: number) => void;
  gap?: number;
};

export const Circles = ({ size, colors = ["#ffcd00"], onCirclePress, gap }: CircleProps) => {
  const numInRow = 5;
  const groups = [];

  for (let i = 0; i < colors.length; i += numInRow) {
    const groupColors = colors.slice(i, i + numInRow);
    groups.push(
      <View key={`group-${i}`} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%" }}>
        {groupColors.map((color, index) => (
          <React.Fragment key={i + index}>
            <Circle size={size} color={color} onCirclePress={() => onCirclePress?.(i + index)} />
            {index < groupColors.length - 1 && <View style={{ width: gap || 3 }} />}
          </React.Fragment>
        ))}
      </View>
    );
  }

  return (
    <View
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {groups.map((group, index) => (
        <React.Fragment key={index}>
          {group}
          {index < groups.length - 1 && <View style={{ height: gap || 3 }} />}
        </React.Fragment>
      ))}
    </View>
  );
};

export default Circles;
