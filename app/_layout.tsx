import { Platform } from "react-native";
import LayoutAndroid from "./_layout.android";
import LayoutIos from "./_layout.ios";

const Layout = Platform.OS === "android" ? LayoutAndroid : LayoutIos;

export default Layout;
