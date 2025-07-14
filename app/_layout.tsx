import { Platform } from "react-native";

let Layout;
if (Platform.OS === "android") {
  Layout = require("./_layout.android").default;
} else {
  Layout = require("./_layout.ios").default;
}

export default Layout;
