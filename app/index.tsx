import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { AlarmService } from "../services/AlarmService";

export default function Index() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();

    const init = async () => {
      await AlarmService.cancelAllAlarms();
      await AlarmService.scheduleAllAlarms();
    };
    init();
  }, []);

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
