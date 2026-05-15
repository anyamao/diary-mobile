import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import api from "../../../api/client";

const moods = [
  { id: "noemotions", name: "Без эмоций", emoji: "😐" },
  { id: "happy", name: "Счастлив", emoji: "😊" },
  { id: "sad", name: "Грустный", emoji: "😔" },
  { id: "verysad", name: "Очень грустный", emoji: "😢" },
  { id: "angry", name: "Злой", emoji: "😠" },
  { id: "stressed", name: "Напряженный", emoji: "😰" },
  { id: "verystressed", name: "Очень напряженный", emoji: "😫" },
  { id: "calm", name: "Спокойный", emoji: "😌" },
];

export default function NewEntryScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("noemotions");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Введите заголовок");
      return;
    }

    setLoading(true);
    try {
      await api.post("/diary/entries", { title, content, mood: selectedMood });
      Alert.alert("Успех", "Запись создана", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать запись");
    } finally {
      setLoading(false);
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
          Новая запись
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{ padding: 8 }}
        >
          {loading ? (
            <ActivityIndicator color="#db2777" />
          ) : (
            <Save size={24} color="#db2777" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
          Настроение
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              onPress={() => setSelectedMood(mood.id)}
              style={{
                backgroundColor: selectedMood === mood.id ? "#fbcfe8" : "white",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: selectedMood === mood.id ? "#db2777" : "#fbcfe8",
              }}
            >
              <Text style={{ fontSize: 14 }}>
                {mood.emoji} {mood.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          placeholder="Заголовок"
          value={title}
          onChangeText={setTitle}
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            fontSize: 18,
            fontWeight: "500",
            marginBottom: 16,
          }}
        />

        <TextInput
          placeholder="Содержание..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={15}
          textAlignVertical="top"
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            minHeight: 300,
          }}
        />
      </ScrollView>
    </View>
  );
}
