import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AlarmService } from "../../../../services/AlarmService";
import { Alarm, RepeatType, weekDays } from "../../../../types/alarm";

export default function NewAlarmScreen() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("once");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [advanceMinutes, setAdvanceMinutes] = useState(5);
  const [showAdvancePicker, setShowAdvancePicker] = useState(false);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Введите название будильника");
      return;
    }

    const timeString = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      title: title.trim(),
      note: note.trim(),
      time: timeString,
      repeatType,
      repeatDays: repeatType === "weekly" ? selectedDays : [],
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      advanceMinutes,
    };

    try {
      await AlarmService.saveAlarm(newAlarm);
      Alert.alert("Успех", "Будильник создан", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать будильник");
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fce7f3" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#fbcfe8",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft size={24} color="#db2777" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            fontSize: 20,
            fontWeight: "bold",
            color: "#be185d",
            textAlign: "center",
          }}
        >
          Новый будильник
        </Text>
        <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
          <Save size={24} color="#db2777" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Время */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
            Время
          </Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <Text
              style={{
                fontSize: 48,
                fontWeight: "bold",
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              {time.getHours().toString().padStart(2, "0")}:
              {time.getMinutes().toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Название */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
            Название
          </Text>
          <TextInput
            placeholder="Например: Подъём"
            value={title}
            onChangeText={setTitle}
            style={{ fontSize: 16, paddingVertical: 8 }}
          />
        </View>

        {/* Заметка */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
            Заметка (необязательно)
          </Text>
          <TextInput
            placeholder="Что нужно сделать сегодня?"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            style={{ fontSize: 14, paddingVertical: 8 }}
          />
        </View>

        {/* Повтор */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
            Повтор
          </Text>

          <TouchableOpacity
            onPress={() => setRepeatType("once")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: repeatType === "once" ? 2 : 1,
              borderBottomColor: repeatType === "once" ? "#db2777" : "#e5e7eb",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                color: repeatType === "once" ? "#db2777" : "#374151",
              }}
            >
              Однократный
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRepeatType("daily")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: repeatType === "daily" ? 2 : 1,
              borderBottomColor: repeatType === "daily" ? "#db2777" : "#e5e7eb",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                color: repeatType === "daily" ? "#db2777" : "#374151",
              }}
            >
              Ежедневно
            </Text>
          </TouchableOpacity>

          <View style={{ marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => setRepeatType("weekly")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: repeatType === "weekly" ? "#db2777" : "#374151",
                }}
              >
                Еженедельно
              </Text>
            </TouchableOpacity>

            {repeatType === "weekly" && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {weekDays.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    onPress={() => toggleDay(day.value)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: selectedDays.includes(day.value)
                        ? "#db2777"
                        : "#f3f4f6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: selectedDays.includes(day.value)
                          ? "white"
                          : "#374151",
                        fontWeight: "500",
                      }}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Уведомление заранее */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
            Напомнить заранее
          </Text>

          <TouchableOpacity
            onPress={() => setShowAdvancePicker(!showAdvancePicker)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 16, color: "#374151" }}>
              {advanceMinutes === 0
                ? "Не напоминать"
                : `За ${advanceMinutes} минут`}
            </Text>
            <Text style={{ fontSize: 16, color: "#9ca3af" }}>▼</Text>
          </TouchableOpacity>

          {showAdvancePicker && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {[0, 5, 10, 15, 30, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  onPress={() => {
                    setAdvanceMinutes(minutes);
                    setShowAdvancePicker(false);
                  }}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      color: advanceMinutes === minutes ? "#db2777" : "#374151",
                    }}
                  >
                    {minutes === 0 ? "Не напоминать" : `За ${minutes} минут`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
