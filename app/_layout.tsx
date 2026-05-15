import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useAuthStore } from "../store/authStore";
import { AlarmService } from ".././services/AlarmService";

// Настройка каналов для Android
Notifications.setNotificationChannelAsync("alarms", {
  name: "Будильники",
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#db2777",
  sound: "default",
  bypassDnd: true,
});

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();

    // Слушатель для уведомлений
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        if (data?.alarmId && data?.type === "alarm") {
          // Здесь можно открыть экран сработавшего будильника
          console.log("Alarm triggered:", data.alarmId);
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
