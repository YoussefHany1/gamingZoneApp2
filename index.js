import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Background/quit state messages handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // Keep minimal work here; heavy work should be delegated
  console.log("Message handled in the background!", remoteMessage?.messageId);
});
