import { useEffect, useRef } from "react";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { Platform, AppState } from "react-native";
import { useAuthStore } from "../store/authStore";

Notifications.setNotificationChannelAsync("alarms", {
  name: "Будильники",
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#db2777",
  sound: "default",
  bypassDnd: true,
});

export default function RootLayout() {
  const { checkAuth } = useAuthStore();
  const lastNotification = useRef<string>();

  useEffect(() => {
    checkAuth();
    requestPermissions();

    // Слушатель для уведомлений
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        const { data } = notification.request.content;
        if (
          data?.alarmId &&
          data?.type === "alarm" &&
          lastNotification.current !== data.alarmId
        ) {
          lastNotification.current = data.alarmId;
          router.push({
            pathname: "/alarm-ring",
            params: { id: data.alarmId, title: data.title, note: data.note },
          });
        }
      },
    );

    // Слушатель для нажатия на уведомление
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        if (data?.alarmId) {
          router.push({
            pathname: "/alarm-ring",
            params: { id: data.alarmId, title: data.title, note: data.note },
          });
        }
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const requestPermissions = async () => {
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

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen
        name="alarm-ring"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}
