import Constants from "expo-constants";

// app.json의 version과 자동 연동
const LOCAL_VERSION: string = Constants.expoConfig?.version ?? "1.0.0";

export default LOCAL_VERSION;
