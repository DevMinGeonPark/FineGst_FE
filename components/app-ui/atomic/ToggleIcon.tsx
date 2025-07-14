import { Image, ImageSourcePropType, Pressable, View } from "react-native";

const ToggleIcon = ({ iconName, onPress }: { iconName: ImageSourcePropType | undefined; onPress: () => void }) => {
  return (
    <Pressable
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
    >
      <Image source={iconName} />
    </Pressable>
  );
};

export default ToggleIcon;
