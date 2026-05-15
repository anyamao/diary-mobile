import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import api from "../../api/client";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !username || !password) {
      Alert.alert("Ошибка", "Заполните все обязательные поля");
      return;
    }

    // Базовая валидация пароля на клиенте
    if (password.length < 8) {
      Alert.alert("Ошибка", "Пароль должен содержать минимум 8 символов");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      Alert.alert(
        "Ошибка",
        "Пароль должен содержать хотя бы одну заглавную букву",
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      Alert.alert(
        "Ошибка",
        "Пароль должен содержать хотя бы одну строчную букву",
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      Alert.alert("Ошибка", "Пароль должен содержать хотя бы одну цифру");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        email,
        username,
        password,
        full_name: fullName,
      });

      console.log("✅ Register response:", response.status);

      Alert.alert("Успех", "Регистрация прошла успешно!", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
    } catch (error: any) {
      console.error("❌ Register error:", error);

      let message = "Ошибка регистрации";

      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }

      Alert.alert("Ошибка", message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fce7f3" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#be185d",
              marginBottom: 8,
            }}
          >
            Добро пожаловать!
          </Text>
          <Text style={{ fontSize: 16, color: "#6b7280" }}>
            Создайте новый аккаунт
          </Text>
        </View>

        <View
          style={{ backgroundColor: "white", borderRadius: 16, padding: 20 }}
        >
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#fbcfe8",
              paddingVertical: 12,
              marginBottom: 16,
              fontSize: 16,
            }}
          />

          <TextInput
            placeholder="Имя пользователя"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#fbcfe8",
              paddingVertical: 12,
              marginBottom: 16,
              fontSize: 16,
            }}
          />

          <TextInput
            placeholder="Полное имя (опционально)"
            value={fullName}
            onChangeText={setFullName}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#fbcfe8",
              paddingVertical: 12,
              marginBottom: 16,
              fontSize: 16,
            }}
          />

          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              placeholder="Пароль (минимум 8 символов)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#fbcfe8",
                paddingVertical: 12,
                fontSize: 16,
                paddingRight: 40,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 0, top: 12 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9ca3af" />
              ) : (
                <Eye size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#db2777",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Зарегистрироваться
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#6b7280" }}>Уже есть аккаунт? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={{ color: "#db2777", fontWeight: "600" }}>Войти</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
