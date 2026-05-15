import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Plus, Bell, BellOff, Edit3, Trash2, Clock } from "lucide-react-native";
import { useAuthStore } from "../../../store/authStore";
import { AlarmService } from "../../../services/AlarmService";
import { Alarm, fullWeekDays } from "../../../types/alarm";
import { showConfirm } from "../../../components/ConfirmDialog";

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const loadAlarms = async () => {
    try {
      const loaded = await AlarmService.getAllAlarms();
      setAlarms(loaded.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      console.error("Failed to load alarms:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, []),
  );

  const handleToggleAlarm = async (id: string, isEnabled: boolean) => {
    try {
      await AlarmService.toggleAlarm(id, !isEnabled);
      await loadAlarms();
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось изменить статус будильника");
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    const confirmed = await showConfirm(
      "Удалить будильник?",
      "Вы уверены, что хотите удалить этот будильник?",
      "danger",
    );
    if (confirmed) {
      try {
        await AlarmService.deleteAlarm(id);
        await loadAlarms();
      } catch (error) {
        Alert.alert("Ошибка", "Не удалось удалить будильник");
      }
    }
  };

  const getRepeatText = (alarm: Alarm): string => {
    if (alarm.repeatType === "once") return "Однократный";
    if (alarm.repeatType === "daily") return "Ежедневно";
    if (alarm.repeatType === "weekly" && alarm.repeatDays.length > 0) {
      const days = alarm.repeatDays
        .map((d) => fullWeekDays[d].slice(0, 2))
        .join(", ");
      return `Каждые: ${days}`;
    }
    return "";
  };

  const renderAlarm = ({ item }: { item: Alarm }) => (
    <TouchableOpacity
      onPress={() => router.push(`/alarms/${item.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#fbcfe8",
        opacity: item.isEnabled ? 1 : 0.6,
      }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937" }}>
            {item.time}
          </Text>
          {!item.isEnabled && (
            <View
              style={{
                backgroundColor: "#f3f4f6",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: "#6b7280" }}>Выкл</Text>
            </View>
          )}
        </View>

        {item.title && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#374151",
              marginBottom: 2,
            }}
          >
            {item.title}
          </Text>
        )}

        {item.note && (
          <Text
            style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
            numberOfLines={1}
          >
            {item.note}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          <Clock size={12} color="#9ca3af" />
          <Text style={{ fontSize: 10, color: "#9ca3af" }}>
            {getRepeatText(item)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Switch
          value={item.isEnabled}
          onValueChange={() => handleToggleAlarm(item.id, item.isEnabled)}
          trackColor={{ false: "#d1d5db", true: "#fbcfe8" }}
          thumbColor={item.isEnabled ? "#db2777" : "#f472b6"}
        />
        <TouchableOpacity onPress={() => router.push(`/alarms/${item.id}`)}>
          <Edit3 size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteAlarm(item.id)}>
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fce7f3" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#be185d" }}>
          Будильники
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/alarms/new")}
          style={{ backgroundColor: "#db2777", padding: 10, borderRadius: 30 }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={alarms}
        renderItem={renderAlarm}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              marginTop: 60,
              paddingHorizontal: 32,
            }}
          >
            <Bell size={48} color="#d1d5db" />
            <Text
              style={{
                fontSize: 18,
                color: "#6b7280",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              Нет будильников
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#9ca3af",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Нажмите на плюс, чтобы добавить первый будильник
            </Text>
          </View>
        }
      />
    </View>
  );
}
