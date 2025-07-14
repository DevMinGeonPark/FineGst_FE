import React from "react";
// import { Box } from '@gluestack-ui/themed';
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../components/app-ui/modules/footer";
import Header from "../../components/app-ui/modules/header";
import { LayoutOptions, useCommonLayout } from "./useCommonLayout";
import FixBar from "../app-ui/modules/FixBar";
import useFixBarStore from "../../store/fixBarStore";
import { Ionicons } from "@expo/vector-icons";
import useShowToggleIconsStore from "../../store/showToggleIconsStore";
import ToggleIcons from "../app-ui/modules/toggleIcons";
// import Footer from '../../components/app/atomic/Footer';
// import FixBar from '../../components/app/atomic/FixBar';
// import GoCustomerCenter from '../../components/app/atomic/GoCustomerCenter';
// import { FixBarContextProvider } from '../../contexts/FixBarStateContext';
// import { FlatListContext } from '../../contexts/FlatListContext';
// import Footer from '@src/Modules/Footer';
// import FixBar from '@src/Modules/Detail/FixBar';
// import GoCustomerCenter from '@src/Atomic/Main/GoCustomerCenter';
// import { FixBarContextProvider } from '@src/contexts/FixBarStateContext';
// import { FlatListContext } from '@src/contexts/FlatListContext';

interface ListItem {
  type: "header" | "content" | "space" | "footer";
  content?: React.ReactNode;
}

interface CommonLayoutProps {
  children: React.ReactNode;
  options?: LayoutOptions;
}

export const CommonLayout: React.FC<CommonLayoutProps> = ({ children, options }) => {
  const { flatListRef } = useCommonLayout(options);
  const { showFixBar } = useFixBarStore();
  const { showToggleIcons } = useShowToggleIconsStore();

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return <Header />;
    } else if (item.type === "content") {
      return <>{item.content}</>;
    } else if (item.type === "space") {
      return <View style={{ width: 30, height: 30 }} />;
    } else if (item.type === "footer") {
      return <Footer />;
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        ref={flatListRef}
        scrollEventThrottle={16}
        data={[{ type: "header" }, { type: "content", content: children }, { type: "space" }, { type: "footer" }]}
        renderItem={renderItem}
        keyExtractor={(item, index) => `wr-${item.type}-${index}`}
      />
      {showFixBar && <FixBar />}
      {showToggleIcons && <ToggleIcons />}
    </SafeAreaView>
  );
};
