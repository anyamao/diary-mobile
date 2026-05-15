import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save, Trash2 } from "lucide-react-native";
import api from "../../../../api/client";
import { showConfirm } from "../../../../components/ConfirmDialog";

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await api.get(`/diary/entries/${id}`);
      setTitle(response.data.title);
      setContent(response.data.content);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось загрузить запись");
      router.back();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Введите заголовок");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/diary/entries/${id}`, { title, content });
      Alert.alert("Успех", "Запись обновлена", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось обновить запись");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      "Удалить запись?",
      "Вы уверены, что хотите удалить эту запись?",
      "danger",
    );
    if (confirmed) {
      setDeleting(true);
      try {
        await api.delete(`/diary/entries/${id}`);
        Alert.alert("Успех", "Запись удалена", [
          { text: "OK", onPress: () => router.replace("/diary") },
        ]);
      } catch (error) {
        Alert.alert("Ошибка", "Не удалось удалить запись");
      } finally {
        setDeleting(false);
      }
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
          Редактировать
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
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          style={{ padding: 8 }}
        >
          {deleting ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Trash2 size={24} color="#ef4444" />
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
