import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Bookmark, Trash2, Filter, Search, X, Star } from "lucide-react-native";
import { useAuthStore } from "../../../store/authStore";
import api from "../../../api/client";
import { showConfirm } from "../../../components/ConfirmDialog";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  is_favorite: boolean;
  created_at: string;
}

const moodImages: Record<string, string> = {
  noemotions: "😐",
  happy: "😊",
  sad: "😔",
  verysad: "😢",
  angry: "😠",
  stressed: "😰",
  verystressed: "😫",
  calm: "😌",
};

const moodMap: Record<string, string> = {
  noemotions: "/noemotions.png",
  happy: "/happy.png",
  sad: "/sad.png",
  verysad: "/verysad.png",
  angry: "/angry.png",
  stressed: "/stressed.png",
  verystressed: "/verystressed.png",
  calm: "/calm.png",
};

export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const { user, isAuthenticated } = useAuthStore();

  const fetchEntries = async () => {
    try {
      const response = await api.get("/diary/entries");
      setEntries(response.data);
      filterEntries(response.data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      Alert.alert("Ошибка", "Не удалось загрузить записи");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterEntries = (data: DiaryEntry[]) => {
    let filtered = [...data];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query),
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter(
          (entry) => new Date(entry.created_at) >= today,
        );
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter(
          (entry) => new Date(entry.created_at) >= weekAgo,
        );
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(
          (entry) => new Date(entry.created_at) >= monthAgo,
        );
        break;
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredEntries(filtered);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterEntries(entries);
  }, [searchQuery, sortOrder, dateFilter, entries]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchEntries();
      }
    }, [isAuthenticated]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    const confirmed = await showConfirm(
      "Удалить запись?",
      "Вы уверены, что хотите удалить эту запись?",
      "danger",
    );
    if (confirmed) {
      try {
        await api.delete(`/diary/entries/${id}`);
        fetchEntries();
        Alert.alert("Успех", "Запись удалена");
      } catch (error) {
        Alert.alert("Ошибка", "Не удалось удалить запись");
      }
    }
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/diary/entries/${id}`, { is_favorite: !currentStatus });
      fetchEntries();
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось изменить статус");
    }
  };

  const getMoodImage = (mood: string) => {
    return moodImages[mood] || "😐";
  };

  const getMoodImageUrl = (mood: string) => {
    return moodMap[mood] || "/noemotions.png";
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortOrder("newest");
    setDateFilter("all");
    setShowFilters(false);
  };

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

  const renderEntry = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      onPress={() => router.push(`/diary/${item.id}`)}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: "#f472b6",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image
            source={{ uri: getMoodImageUrl(item.mood) }}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            {new Date(item.created_at).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id, item.is_favorite)}
          >
            <Bookmark
              size={20}
              color={item.is_favorite ? "#eab308" : "#9ca3af"}
              fill={item.is_favorite ? "#eab308" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteEntry(item.id)}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#1f2937",
          marginBottom: 8,
        }}
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <Text style={{ fontSize: 14, color: "#6b7280" }} numberOfLines={3}>
        {item.content?.replace(/[#*`]/g, "").slice(0, 150)}
        {item.content?.length > 150 ? "..." : ""}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fce7f3" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fce7f3",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#be185d" }}>
          Мой дневник
        </Text>
        <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          С возвращением, {user?.full_name || user?.username || "Друг"}!
        </Text>
      </View>

      {/* Поиск и фильтры */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: "#fbcfe8",
            }}
          >
            <Search size={16} color="#9ca3af" />
            <TextInput
              placeholder="Поиск..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 8,
                fontSize: 14,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters ? "#db2777" : "white",
              paddingHorizontal: 12,
              borderRadius: 8,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#fbcfe8",
            }}
          >
            <Filter size={18} color={showFilters ? "white" : "#6b7280"} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 12,
              marginTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => setSortOrder("newest")}>
                  <Text
                    style={{
                      color: sortOrder === "newest" ? "#db2777" : "#6b7280",
                      fontWeight: sortOrder === "newest" ? "600" : "400",
                    }}
                  >
                    Сначала новые
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortOrder("oldest")}>
                  <Text
                    style={{
                      color: sortOrder === "oldest" ? "#db2777" : "#6b7280",
                      fontWeight: sortOrder === "oldest" ? "600" : "400",
                    }}
                  >
                    Сначала старые
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={clearFilters}>
                <X size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {(["all", "today", "week", "month"] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setDateFilter(filter)}
                >
                  <Text
                    style={{
                      color: dateFilter === filter ? "#db2777" : "#6b7280",
                      fontSize: 12,
                    }}
                  >
                    {filter === "all"
                      ? "Все"
                      : filter === "today"
                        ? "Сегодня"
                        : filter === "week"
                          ? "Неделя"
                          : "Месяц"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
          Найдено записей: {filteredEntries.length}
        </Text>
      </View>

      {/* Список записей */}
      {filteredEntries.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
          <Text
            style={{
              fontSize: 18,
              color: "#6b7280",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {searchQuery || dateFilter !== "all"
              ? "Ничего не найдено"
              : "Нет записей"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9ca3af",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {searchQuery || dateFilter !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Напишите свою первую запись!"}
          </Text>
          {searchQuery || dateFilter !== "all" ? (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={{ color: "#db2777" }}>Сбросить фильтры</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/diary/new")}
              style={{
                backgroundColor: "#db2777",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Создать первую запись
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#db2777"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
