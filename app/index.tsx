import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("alarms", {
        name: "Будильники",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#db2777",
        sound: "default",
        bypassDnd: true,
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(app)/(tabs)/diary");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fce7f3",
      }}
    >
      <ActivityIndicator size="large" color="#db2777" />
    </View>
  );
}
