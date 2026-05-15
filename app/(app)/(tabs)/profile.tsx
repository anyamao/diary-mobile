import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { LogOut, User, Mail, Calendar } from "lucide-react-native";
import { useAuthStore } from "../../../store/authStore";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fce7f3",
        }}
      >
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fce7f3" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Аватар и имя */}
        <View
          style={{ alignItems: "center", paddingTop: 40, paddingBottom: 24 }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#fbcfe8",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#be185d" }}>
            {user?.full_name || user?.username}
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {user?.email}
          </Text>
        </View>

        {/* Информация */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            marginHorizontal: 20,
            marginBottom: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <Mail size={20} color="#db2777" />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>Email</Text>
              <Text style={{ fontSize: 16, color: "#1f2937" }}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <User size={20} color="#db2777" />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                Имя пользователя
              </Text>
              <Text style={{ fontSize: 16, color: "#1f2937" }}>
                {user?.username}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Calendar size={20} color="#db2777" />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                Дата регистрации
              </Text>
              <Text style={{ fontSize: 16, color: "#1f2937" }}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("ru-RU")
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Кнопка выхода */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginHorizontal: 20,
            backgroundColor: "#fee2e2",
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={{ color: "#dc2626", fontWeight: "600", fontSize: 16 }}>
            Выйти из аккаунта
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
