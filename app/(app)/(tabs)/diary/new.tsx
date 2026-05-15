import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import api from "../../../../api/client";

export default function NewEntryScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Введите заголовок");
      return;
    }

    setLoading(true);
    try {
      await api.post("/diary/entries", { title, content });
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
          numberOfLines={10}
          textAlignVertical="top"
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            minHeight: 200,
          }}
        />
      </ScrollView>
    </View>
  );
}
