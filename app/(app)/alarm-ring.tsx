import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  Platform,
  BackHandler,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { X, Bell, Volume2, VolumeX } from "lucide-react-native";
import { AlarmService } from "../../services/AlarmService";

export default function AlarmRingScreen() {
  const { id, title, note } = useLocalSearchParams();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundLoaded, setSoundLoaded] = useState(false);

  useEffect(() => {
    // Вибрация
    const vibrationPattern =
      Platform.OS === "ios" ? [0, 1000] : [0, 1000, 500, 1000, 500, 1000];
    Vibration.vibrate(vibrationPattern, true);

    // Звук
    playSound();

    // Блокируем кнопку "Назад"
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => {
      Vibration.cancel();
      // Безопасное отключение звука
      if (soundRef.current) {
        try {
          soundRef.current.stopAsync();
          soundRef.current.unloadAsync();
        } catch (e) {
          console.log("Error stopping sound:", e);
        }
      }
      backHandler.remove();
    };
  }, []);

  const playSound = async () => {
    try {
      let soundModule;
      try {
        soundModule = require("../../assets/alarm.mp3");
      } catch (e) {
        console.warn("alarm.mp3 not found");
        setSoundLoaded(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundModule, {
        shouldPlay: true,
        isLooping: true,
        volume: 0.8,
      });
      soundRef.current = sound;
      setSoundLoaded(true);
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound:", error);
      setSoundLoaded(false);
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (soundRef.current && soundLoaded) {
      try {
        await soundRef.current.setVolumeAsync(newMuted ? 0 : 0.8);
      } catch (e) {
        console.log("Error setting volume:", e);
      }
    }

    if (newMuted) {
      Vibration.cancel();
    } else {
      const vibrationPattern = [0, 1000, 500, 1000];
      Vibration.vibrate(vibrationPattern, true);
    }
  };

  const stopAlarm = async () => {
    Vibration.cancel();

    if (soundRef.current && soundLoaded) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log("Error stopping sound:", e);
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (id) {
      const alarms = await AlarmService.getAllAlarms();
      const alarm = alarms.find((a) => a.id === id);
      if (alarm && alarm.repeatType === "once") {
        alarm.isEnabled = false;
        await AlarmService.saveAlarm(alarm);
      }
    }

    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#db2777",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 48 }}>
        <Bell size={80} color="white" />
        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "white",
            marginTop: 24,
          }}
        >
          {title || "Будильник"}
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "#fce7f3",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {note || "Пора вставать!"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={toggleMute}
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {isMuted ? (
          <VolumeX size={30} color="white" />
        ) : (
          <Volume2 size={30} color="white" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={stopAlarm}
        style={{
          backgroundColor: "white",
          width: 80,
          height: 80,
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <X size={40} color="#db2777" />
      </TouchableOpacity>

      <Text style={{ color: "#fce7f3", marginTop: 32, fontSize: 14 }}>
        Нажмите, чтобы отключить
      </Text>
    </View>
  );
}
